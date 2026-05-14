require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-exponea-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-exponea-sdk
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-exponea-sdk"
  # brief license entry:
  s.license      = "MIT License"
  s.authors      = { "Exponea" => "contact@exponea.com" }
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/github_account/react-native-exponea-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.exclude_files = ["ios/Tests/*.{h,c,m,mm,swift}", "ios/build/**/*"]
  s.private_header_files = "ios/**/*.h"

  s.dependency "React-Core"
  s.dependency "ExponeaSDK", "3.11.0"
  s.dependency "AnyCodable-FlightSchool", "0.4.0"

  install_modules_dependencies(s)

  # install_modules_dependencies sets SWIFT_COMPILATION_MODE=wholemodule for static library builds.
  # In wholemodule mode Xcode does not declare the Swift-generated ObjC header as an explicit build
  # task output, so ObjC files can compile before it exists ('react_native_exponea_sdk-Swift.h'
  # not found). Switch to incremental only when USE_FRAMEWORKS=static (the same env var React Native
  # uses) so wholemodule optimization is preserved for dynamic/default builds.
  # See: https://github.com/exponea/exponea-react-native-sdk/issues/138
  if ENV['USE_FRAMEWORKS'] == 'static'
    s.pod_target_xcconfig['SWIFT_COMPILATION_MODE'] = 'incremental'
    s.pod_target_xcconfig['SWIFT_OBJC_INTERFACE_HEADER_NAME'] = 'react_native_exponea_sdk-Swift.h'
    s.pod_target_xcconfig['HEADER_SEARCH_PATHS'] = '$(inherited) "$(PODS_ROOT)/../../node_modules/react-native/ReactCommon" "${PODS_CONFIGURATION_BUILD_DIR}/React-debug/React_debug.framework/Headers" "${PODS_CONFIGURATION_BUILD_DIR}/react-native-exponea-sdk/react_native_exponea_sdk.framework/Headers" "$(OBJECT_FILE_DIR_normal)/$(CURRENT_ARCH)" "$(DERIVED_SOURCES_DIR)"'
  end
end
