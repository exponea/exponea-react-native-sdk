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
  s.dependency "ExponeaSDK", "4.3.0"
  s.dependency "AnyCodable-FlightSchool", "0.4.0"

  install_modules_dependencies(s)

  # Static-framework (USE_FRAMEWORKS=static) builds need extra wiring on top of what
  # install_modules_dependencies(s) provides. Three concrete issues are addressed below:
  #
  # 1. install_modules_dependencies sets SWIFT_COMPILATION_MODE=wholemodule for static library
  #    builds. In wholemodule mode Xcode does not declare the Swift-generated ObjC header as an
  #    explicit build task output, so ObjC files can compile before it exists
  #    ('react_native_exponea_sdk-Swift.h' not found). Switch to incremental only for static
  #    builds so wholemodule optimization is preserved for dynamic/default builds.
  # 2. We re-assign pod_target_xcconfig to layer our overrides; doing so naively would drop
  #    React Native's clang C++ language standard (set by install_modules_dependencies) and
  #    misalign us with the rest of the RN graph. Re-apply rct_cxx_language_standard() so the
  #    target stays in sync.
  # 3. ObjC sources import "react_native_exponea_sdk-Swift.h" but Xcode does not always expose
  #    the generated header path on static-framework builds. We pin the header name explicitly
  #    and append the React Native + codegen + product framework header search paths for both
  #    Debug and Release configurations. Existing HEADER_SEARCH_PATHS are preserved.
  #
  # See: https://github.com/exponea/exponea-react-native-sdk/issues/138
  # CocoaPods exposes pod_target_xcconfig as a writer; the matching reader is attributes_hash.
  if ENV['USE_FRAMEWORKS'] == 'static'
    existing_xcconfig = s.attributes_hash['pod_target_xcconfig'] || {}
    merged_header_search_paths = [
      existing_xcconfig['HEADER_SEARCH_PATHS'] || '$(inherited)',
      '"$(PODS_ROOT)/../../node_modules/react-native/ReactCommon"',
      '"${PODS_CONFIGURATION_BUILD_DIR}/React/React.framework/Headers"',
      '"${PODS_CONFIGURATION_BUILD_DIR}/react-native-exponea-sdk/react_native_exponea_sdk.framework/Headers"',
      '"$(OBJECT_FILE_DIR_normal)/$(CURRENT_ARCH)"',
      '"$(DERIVED_SOURCES_DIR)"'
    ].compact.join(' ')

    s.pod_target_xcconfig = existing_xcconfig.merge(
      'HEADER_SEARCH_PATHS' => merged_header_search_paths,
      'CLANG_CXX_LANGUAGE_STANDARD' => rct_cxx_language_standard(),
      'SWIFT_COMPILATION_MODE' => 'incremental',
      'SWIFT_OBJC_INTERFACE_HEADER_NAME' => 'react_native_exponea_sdk-Swift.h'
    )
  end
end
