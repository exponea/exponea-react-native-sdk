rm -rdf node_modules
rm -rdf android/build
rm -rdf ios/Pods
rm -rdf ios/build
rm -rdf example/node_modules
rm -rdf example/android/build
rm -rdf example/android/app/build
rm -rdf example/ios/Pods
rm -rdf example/ios/build
rm -rf $TMPDIR/metro-*
rm -rdf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all
