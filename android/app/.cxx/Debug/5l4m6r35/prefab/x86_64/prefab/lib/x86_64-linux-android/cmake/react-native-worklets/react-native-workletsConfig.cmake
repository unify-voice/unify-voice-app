if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "D:/Final_year_project/FYP/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/516f5e26/obj/x86_64/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/Final_year_project/FYP/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

