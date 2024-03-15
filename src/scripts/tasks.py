import os

from invoke import task
from git import Repo, GitCommandError
import shutil
import re

source_base_dir = "../source_docs"
repo_base_dir = "../../"

@task
def update_source(c):
    content_dir = f"../content"
    # delete content dir if found
    if os.path.exists(content_dir):
        shutil.rmtree(content_dir)
    # create content directory again
    os.mkdir(content_dir)
    print("content directory is clear")

    # copy dapr main content
    source_content_dir = f"{source_base_dir}/daprdocs/content/en/"
    shutil.copytree(source_content_dir, f"{content_dir}/docs")
    print("dapr content is copied")


#   [[module.mounts]]
#     source = "../sdkdocs/dotnet/daprdocs/content/en/dotnet-sdk-docs"
#     target = "content/developing-applications/sdks/dotnet"
#     lang = "en"
#   [[module.mounts]]
#     source = "../sdkdocs/pluggable-components/dotnet/daprdocs/content/en/dotnet-sdk-docs"
#     target = "content/developing-applications/develop-components/pluggable-components/pluggable-components-sdks/pluggable-components-dotnet"
#     lang = "en"
    # copy sdk docs
    source_sdk_dir = f"{source_base_dir}/sdkdocs"
    # copy each sdk docs to content directory
    for sdk_name in os.listdir(source_sdk_dir):
        sdk_dir_path = f"{source_sdk_dir}/{sdk_name}"
        if os.path.isdir(sdk_dir_path):
            if sdk_name == "pluggable-components":
                for pluggable_components_sdk_name in os.listdir(sdk_dir_path):
                    component_dir = f"{sdk_dir_path}/{pluggable_components_sdk_name}"
                    if os.path.isdir(component_dir):
                        shutil.copytree(f"{component_dir}/daprdocs/content/en/{pluggable_components_sdk_name}-sdk-docs", f"{content_dir}/pluggable-components/{pluggable_components_sdk_name}/")
            else:
                shutil.copytree(f"{sdk_dir_path}/daprdocs/content/en/{sdk_name}-sdk-docs", f"{content_dir}/sdks_{sdk_name}/")
                # copy contribute if sdk-contributing found
                if os.path.exists(f"{sdk_dir_path}/daprdocs/content/en/{sdk_name}-sdk-contributing"):
                    shutil.copytree(f"{sdk_dir_path}/daprdocs/content/en/{sdk_name}-sdk-contributing",
                                    f"{content_dir}/contributing",
                                    dirs_exist_ok=True)
    print("sdk content is copied")

    # create crowdin.yml
#     with open(f"{repo_base_dir}/crowdin.yml", "w", encoding='utf8') as f:
#         f.write("""project_id_env: CROWDIN_PROJECT_ID
# api_token_env: CROWDIN_PERSONAL_TOKEN
# base_path: "./src/"
# preserve_hierarchy: true
# files:
# """)
#         # create an item for every file in content directory and append to crowdin.yml
#         for root, dirs, files in os.walk(content_dir):
#             for file in files:
#                 target_root = root.replace(content_dir, "/content")
#                 file_path = f"{target_root}/{file}"
#                 source = file_path.replace("\\", "/")
#                 f.write(f"    - source: {source}\n")
#                 translation = file_path.replace('/content', '/translated_content/%locale_with_underscore%') \
#                     .replace("\\", "/")
#                 f.write(
#                     f"      translation: {translation}\n")

#     # update aliases
#     # insert /zh-hans to every head of alias in the head of *.md files in content directory
#     for root, dirs, files in os.walk(content_dir):
#         # load file as markdown
#         for file in files:
#             if file.endswith(".md"):
#                 with open(f"{root}/{file}", "r", encoding='utf8') as f:
#                     content = f.read()
#                 # find all text between aliases: and --- of that
#                 aliases_lines = re.findall(r"^aliases:.*?---", content, re.MULTILINE | re.DOTALL)
#                 # split lines by new line
#                 aliases_lines = [line.split("\n") for line in aliases_lines]
#                 # flatten list
#                 aliases_lines = [item for sublist in aliases_lines for item in sublist]
#                 # filter line that starts with "- \"/", "- \'/" or "- /", skip blanks before
#                 aliases_lines = [line for line in aliases_lines if
#                                  line.strip().startswith("- \"/") or line.strip().startswith(
#                                      "- \'/") or line.strip().startswith("- /")]
#                 if aliases_lines:
#                     # create replacement map
#                     replacements = {}
#                     for line in aliases_lines:
#                         # insert /zh-hans before the first "/"
#                         index = line.find("/")
#                         if index != -1:
#                             replacements[line] = line[:index] + "/zh-hans" + line[index:]
#                     # replace all aliases: lines with the new lines
#                     for line in aliases_lines:
#                         content = content.replace(line, replacements[line])
#                     # write the new content to file
#                     with open(f"{root}/{file}", "w", encoding='utf8') as f:
#                         f.write(content)


@task
def update_files_for_building(c):
    docs_dir = f"./source_docs/daprdocs"
    github_action_dir = f"./source_docs/.github/workflows/"
    # copy update_config_zh.sh to docs directory
    shutil.copy("./update_config_zh.sh", f"{docs_dir}/update_config_zh.sh")
    # read content of zh-build.yml and replace %%tag%% to branch
    with open("./zh-build.yml", "r") as f:
        content = f.read()
        content = content.replace("%%tag%%", f"main")
        # write content to docs_dir zh-build.yml
        with open(f"{github_action_dir}/zh-build.yml", "w") as fo:
            fo.write(content)


@task
def clean_translations(c):
    content_dir = f"../translated_content"
    # delete content dir if found
    if os.path.exists(content_dir):
        shutil.rmtree(content_dir)