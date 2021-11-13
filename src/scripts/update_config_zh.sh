sed -i 's/..\/translations\/docs-zh\/content\/zh-hans/..\/translated_content\/zh_CN\/content/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/contributing/..\/translated_content\/zh_CN\/contributing/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_python/..\/translated_content\/zh_CN\/sdks_python/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_php/..\/translated_content\/zh_CN\/sdks_php/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_dotnet/..\/translated_content\/zh_CN\/sdks_dotnet/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_java/..\/translated_content\/zh_CN\/sdks_java/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_go/..\/translated_content\/zh_CN\/sdks_go/g' config.toml
sed -i 's/..\/translations\/docs-zh\/content\/sdks_js/..\/translated_content\/zh_CN\/sdks_js/g' config.toml
sed -i 's/languageCode = "en-us"/defaultContentLanguage = "zh-hans"/g' config.tomlinv --list