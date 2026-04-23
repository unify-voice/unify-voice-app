if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "D:/Final_year_project/FYP/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/Debug/5h1k6e1t/obj/x86/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/Final_year_project/FYP/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

