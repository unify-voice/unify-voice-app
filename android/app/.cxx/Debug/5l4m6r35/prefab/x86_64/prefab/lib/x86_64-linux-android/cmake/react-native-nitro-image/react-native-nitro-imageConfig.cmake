if(NOT TARGET react-native-nitro-image::NitroImage)
add_library(react-native-nitro-image::NitroImage SHARED IMPORTED)
set_target_properties(react-native-nitro-image::NitroImage PROPERTIES
    IMPORTED_LOCATION "D:/Final_year_project/FYP/node_modules/react-native-nitro-image/android/build/intermediates/cxx/Debug/1n4c2h1q/obj/x86_64/libNitroImage.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/Final_year_project/FYP/node_modules/react-native-nitro-image/android/build/headers/nitroimage"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

