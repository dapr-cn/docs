echo "start to create a content folder for all mounted docs"
rm -rf content 
mkdir content
cp -r daprdocs/content/en content/content

mkdir content/contributing

cp -r sdkdocs/python/daprdocs/content/en/python-sdk-docs content/sdks_python
cp sdkdocs/python/daprdocs/content/en/python-sdk-contributing/* content/contributing

cp -r sdkdocs/php/daprdocs/content/en/php-sdk-docs content/sdks_php

cp -r sdkdocs/dotnet/daprdocs/content/en/dotnet-sdk-docs content/sdks_dotnet
cp sdkdocs/dotnet/daprdocs/content/en/dotnet-sdk-contributing/* content/contributing