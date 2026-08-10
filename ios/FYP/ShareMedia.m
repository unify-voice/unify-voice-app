#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

@interface ShareMedia : NSObject <RCTBridgeModule>
@end

@implementation ShareMedia

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(share:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *text = [options[@"text"] isKindOfClass:[NSString class]] ? options[@"text"] : @"";
  NSString *urlString = [options[@"url"] isKindOfClass:[NSString class]] ? options[@"url"] : @"";
  text = [text stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    NSMutableArray *items = [NSMutableArray new];
    if (text.length > 0) {
      [items addObject:text];
    }

    if (urlString.length > 0) {
      NSURL *src = [NSURL URLWithString:urlString];
      if (src.isFileURL) {
        [items addObject:src];
      } else if (src) {
        NSError *error = nil;
        NSData *data = [NSData dataWithContentsOfURL:src options:0 error:&error];
        if (!data) {
          dispatch_async(dispatch_get_main_queue(), ^{
            reject(@"share", error.localizedDescription ?: @"Could not download the sign video.", error);
          });
          return;
        }
        NSString *ext = src.pathExtension.length > 0 ? src.pathExtension : @"mp4";
        NSString *name = [NSString stringWithFormat:@"unify-sign-%@.%@", NSUUID.UUID.UUIDString, ext];
        NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:name];
        if (![data writeToFile:path atomically:YES]) {
          dispatch_async(dispatch_get_main_queue(), ^{
            reject(@"share", @"Could not save the sign video.", nil);
          });
          return;
        }
        [items addObject:[NSURL fileURLWithPath:path]];
      }
    }

    if (items.count == 0) {
      resolve(@NO);
      return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
      UIViewController *root = RCTPresentedViewController();
      if (!root) {
        reject(@"share", @"No view controller to present share sheet.", nil);
        return;
      }
      UIActivityViewController *sheet = [[UIActivityViewController alloc] initWithActivityItems:items applicationActivities:nil];
      UIPopoverPresentationController *popover = sheet.popoverPresentationController;
      if (popover) {
        popover.sourceView = root.view;
        popover.sourceRect = CGRectMake(CGRectGetMidX(root.view.bounds), CGRectGetMidY(root.view.bounds), 1, 1);
        popover.permittedArrowDirections = 0;
      }
      sheet.completionWithItemsHandler = ^(UIActivityType __unused type, BOOL completed, NSArray *__unused returned, NSError *error) {
        if (error) {
          reject(@"share", error.localizedDescription, error);
          return;
        }
        resolve(@(completed));
      };
      [root presentViewController:sheet animated:YES completion:nil];
    });
  });
}

@end
