if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/sulaiman/Documents/FYP/project/unify-voice-app/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/6o6s3d5e/obj/x86_64/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/sulaiman/Documents/FYP/project/unify-voice-app/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

