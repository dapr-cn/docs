import os

from invoke import task
from git import Repo, GitCommandError
import shutil
import re

source_base_dir = "../source"
dapr_cn_base_dir = "../dapr-cn"
repo_base_dir = "../../"

all_versions = [
    "v1.0",
    "v1.1",
    "v1.2",
    "v1.3",
    "v1.4",
    "v1.5",
]


@task
def update_source(c):
    # update source file in translation branches
    for branch in all_versions:
        update_source_core(branch)


def update_source_core(branch: str):
    branch_dir = f"{dapr_cn_base_dir}/{branch}"
    content_dir = f"{branch_dir}/content"
    # delete content dir if found
    if os.path.exists(content_dir):
        shutil.rmtree(content_dir)
    # create content directory again
    os.mkdir(content_dir)
    print("content directory is clear")

    # copy dapr main content
    source_content_dir = f"{source_base_dir}/{branch}/daprdocs/content/en/"
    shutil.copytree(source_content_dir, f"{content_dir}/content")
    print("dapr content is copied")

    # copy sdk docs
    source_sdk_dir = f"{source_base_dir}/{branch}/sdkdocs"
    # copy each sdk docs to content directory
    for sdk_dir in os.listdir(source_sdk_dir):
        sdk_dir_path = f"{source_sdk_dir}/{sdk_dir}"
        if os.path.isdir(sdk_dir_path):
            shutil.copytree(f"{sdk_dir_path}/daprdocs/content/en/{sdk_dir}-sdk-docs", f"{content_dir}/sdks_{sdk_dir}/")
            # copy contribute if sdk-contributing found
            if os.path.exists(f"{sdk_dir_path}/daprdocs/content/en/{sdk_dir}-sdk-contributing"):
                shutil.copytree(f"{sdk_dir_path}/daprdocs/content/en/{sdk_dir}-sdk-contributing",
                                f"{content_dir}/contributing",
                                dirs_exist_ok=True)
    print("sdk content is copied")

    # create crowdin.yml
    with open(f"{branch_dir}/crowdin.yml", "w", encoding='utf8') as f:
        f.write("""project_id_env: CROWDIN_PROJECT_ID
api_token_env: CROWDIN_PERSONAL_TOKEN
base_path: "./"
preserve_hierarchy: true
files:
""")
        # create an item for every file in content directory and append to crowdin.yml
        for root, dirs, files in os.walk(content_dir):
            for file in files:
                target_root = root.replace(content_dir, "/content")
                file_path = f"{target_root}/{file}"
                source = file_path.replace("\\", "/")
                f.write(f"    - source: {source}\n")
                translation = file_path.replace('/content', '/translated_content/%locale_with_underscore%') \
                    .replace("\\", "/")
                f.write(
                    f"      translation: {translation}\n")

    # update aliases
    # insert /zh-hans to every head of alias in the head of *.md files in content directory
    for root, dirs, files in os.walk(content_dir):
        # load file as markdown
        for file in files:
            if file.endswith(".md"):
                with open(f"{root}/{file}", "r", encoding='utf8') as f:
                    content = f.read()
                # find all text between aliases: and --- of that
                aliases_lines = re.findall(r"^aliases:.*?---", content, re.MULTILINE | re.DOTALL)
                # split lines by new line
                aliases_lines = [line.split("\n") for line in aliases_lines]
                # flatten list
                aliases_lines = [item for sublist in aliases_lines for item in sublist]
                # filter line that starts with "- \"/", "- \'/" or "- /", skip blanks before
                aliases_lines = [line for line in aliases_lines if
                                 line.strip().startswith("- \"/") or line.strip().startswith(
                                     "- \'/") or line.strip().startswith("- /")]
                if aliases_lines:
                    # create replacement map
                    replacements = {}
                    for line in aliases_lines:
                        # insert /zh-hans before the first "/"
                        index = line.find("/")
                        if index != -1:
                            replacements[line] = line[:index] + "/zh-hans" + line[index:]
                    # replace all aliases: lines with the new lines
                    for line in aliases_lines:
                        content = content.replace(line, replacements[line])
                    # write the new content to file
                    with open(f"{root}/{file}", "w", encoding='utf8') as f:
                        f.write(content)

    # special handling for v1.0
    if branch == "v1.0":
        # update some html to avoid error in crowdin
        for root, dirs, files in os.walk(content_dir):
            for file in files:
                if file.endswith(".md"):
                    # update /content/getting-started/_index.md
                    if file == "_index.md":
                        with open(f"{root}/_index.md", "r", encoding='utf8') as f:
                            content = f.read()
                        content = content.replace(
                            "<a class=\"btn btn-primary\" href=\"{{< ref install-dapr-cli.md >}}\" role=\"button\">First step: Install the Dapr CLI >></a>",
                            "[First step: Install the Dapr CLI]({{< ref install-dapr-cli.md >}})")
                        with open(f"{root}/_index.md", "w", encoding='utf8') as f:
                            f.write(content)
                    # update /content/getting-started/get-started-api.md
                    if file == "get-started-api.md":
                        with open(f"{root}/get-started-api.md", "r", encoding='utf8') as f:
                            content = f.read()
                        content = content.replace(
                            "<a class=\"btn btn-primary\" href=\"{{< ref get-started-component.md >}}\" role=\"button\">Next step: Define a component >></a>",
                            "[Next step: Define a component]({{< ref get-started-component.md >}})")
                        with open(f"{root}/get-started-api.md", "w", encoding='utf8') as f:
                            f.write(content)
                    # update /content/getting-started/get-started-component.md
                    if file == "get-started-component.md":
                        with open(f"{root}/get-started-component.md", "r", encoding='utf8') as f:
                            content = f.read()
                        content = content.replace(
                            "<a class=\"btn btn-primary\" href=\"{{< ref quickstarts.md >}}\" role=\"button\">Next step: Explore Dapr quickstarts >></a>",
                            "[Next step: Explore Dapr quickstarts]({{< ref quickstarts.md >}})")
                        with open(f"{root}/get-started-component.md", "w", encoding='utf8') as f:
                            f.write(content)
                    # update /content/getting-started/install-dapr-cli.md
                    if file == "install-dapr-cli.md":
                        with open(f"{root}/install-dapr-cli.md", "r", encoding='utf8') as f:
                            content = f.read()
                        content = content.replace(
                            "<a class=\"btn btn-primary\" href=\"{{< ref install-dapr-selfhost.md >}}\" role=\"button\">Next step: Initialize Dapr >></a>",
                            "[Next step: Initialize Dapr]({{< ref install-dapr-selfhost.md >}})")
                        with open(f"{root}/install-dapr-cli.md", "w", encoding='utf8') as f:
                            f.write(content)
                    # update /content/getting-started/install-dapr-selfhost.md
                    if file == "install-dapr-selfhost.md":
                        with open(f"{root}/install-dapr-selfhost.md", "r", encoding='utf8') as f:
                            content = f.read()
                        content = content.replace(
                            "<a class=\"btn btn-primary\" href=\"{{< ref get-started-api.md >}}\" role=\"button\">Next step: Use the Dapr API >></a>",
                            "[Next step: Use the Dapr API]({{< ref get-started-api.md >}})")
                        with open(f"{root}/install-dapr-selfhost.md", "w", encoding='utf8') as f:
                            f.write(content)

    print(f"{branch} source content is updated")


@task
def update_files_for_building(c):
    # to update file to building in github action in dapr-cn/docs
    print("Updating files for building")
    for branch in all_versions:
        update_files_for_building_core(branch)
    print("Files are updated")


def update_files_for_building_core(branch):
    branch_dir = f"{dapr_cn_base_dir}/{branch}"
    docs_dir = f"{branch_dir}/daprdocs"
    github_action_dir = f"{branch_dir}/.github/workflows/"
    # copy update_config_zh.sh to docs directory
    shutil.copy("./update_config_zh.sh", f"{docs_dir}/update_config_zh.sh")
    # read content of zh-build.yml and replace %%tag%% to branch
    with open("./zh-build.yml", "r") as f:
        content = f.read()
        content = content.replace("%%tag%%", f"{branch}/translate_site")
        # write content to docs_dir zh-build.yml
        with open(f"{github_action_dir}/zh-build.yml", "w") as fo:
            fo.write(content)


@task
def update_all_submodules(c):
    # to update all submodules when you want to sync source content to translate content
    print("Updating all submodules")
    repo = Repo(repo_base_dir)
    repo.submodule_update(init=True, recursive=True)
    print("Submodules are updated")

    print("Pull source content of dapr_cn")
    for branch in all_versions:
        repo = Repo(f"{dapr_cn_base_dir}/{branch}")

        print(f"check out {branch}/translate_site")
        repo.git.checkout(f"{branch}/translate_site")

        print(f"pull {branch}/translate_site")
        repo.git.pull("origin", f"{branch}/translate_site")

        print(f"submodule update {branch}/translate_site")
        repo.submodule_update(init=True, recursive=True)

        print(f"{branch} dapr_cn is updated")

    print("Pull source content of dapr docs")
    for branch in all_versions:
        repo = Repo(f"{source_base_dir}/{branch}")

        print(f"check out {branch}")
        repo.git.checkout(branch)

        print(f"pull {branch}")
        repo.git.pull("origin", branch)

        print(f"submodule update {branch}")
        repo.submodule_update(init=True, recursive=True)
        print(f"{branch} dapr docs is updated")

    print("Update all submodules done")


@task
def clean_translations(c):
    print("Cleaning all translations")
    for branch in all_versions:
        clean_translations_core(branch)
    print("All translations are cleaned")


def clean_translations_core(branch: str):
    content_dir = f"{dapr_cn_base_dir}/{branch}/translated_content"
    # delete content dir if found
    if os.path.exists(content_dir):
        shutil.rmtree(content_dir)


@task
def commit_all(c):
    print("Committing all submodules")
    for tag in all_versions:
        print(f"Committing {tag}")
        commit_submodule_core(tag)
        print(f"{tag} is committed")
    # commit base repo
    main_repo = Repo(repo_base_dir)
    if main_repo.is_dirty():
        main_repo.git.add("--all")
        main_repo.git.commit("-m", "Update submodules")
        main_repo.git.push("origin")
        print("Changes are committed")
    print("All submodules are committed")


def commit_submodule_core(tag: str):
    repo = Repo(f"{repo_base_dir}/src/dapr-cn/{tag}")
    # check if there is any changes
    if repo.is_dirty():
        repo.git.add("--all")
        repo.git.commit("-m", f"Update content for {tag}")
        repo.git.push("origin")
        print("Changes are committed")
    else:
        print("No changes found")
