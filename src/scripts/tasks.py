import os

from invoke import task
from git import Repo, GitCommandError
import shutil

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
    for branch in all_versions:
        update_source_core(branch)


def update_source_core(branch: str):
    content_dir = f"{dapr_cn_base_dir}/{branch}/content"
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

    print(f"{branch} source content is updated")


@task
def update_files_for_building(c):
    print("Updating files for building")
    for branch in all_versions:
        update_files_for_building_core(branch)
    print("Files are updated")


def update_files_for_building_core(branch):
    docs_dir = f"{dapr_cn_base_dir}/{branch}/daprdocs"
    github_action_dir = f"{dapr_cn_base_dir}/{branch}/.github/workflows/"
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
    print("Updating all submodules")
    repo = Repo(repo_base_dir)
    repo.submodule_update(init=True, recursive=True)
    print("Submodules are updated")

    print("Pull source content of dapr_cn")
    for branch in all_versions:
        repo = Repo(f"{dapr_cn_base_dir}/{branch}")
        repo.git.pull("origin", f"{branch}/translate_site")
        repo.submodule_update(init=True, recursive=True)
        print(f"{branch} dapr_cn is updated")

    print("Pull source content of dapr docs")
    for branch in all_versions:
        repo = Repo(f"{source_base_dir}/{branch}")
        repo.git.pull("origin", branch)
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
