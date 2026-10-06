#!/bin/sh
rm -rdf .yarn/cache
rm -rdf node_modules
rm -rdf android/build
rm -rdf ios/Pods
rm -rdf ios/build

for dir in example; do
  rm -rf $dir/.yarn/cache
  rm -rf $dir/node_modules
  rm -rf $dir/android/build
  rm -rf $dir/android/app/build
  rm -rf $dir/ios/Pods
  rm -rf $dir/ios/build
done

rm -rdf coverage
rm -rf $TMPDIR/metro-*
rm -rdf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all
