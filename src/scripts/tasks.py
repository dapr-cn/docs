import os

from invoke import task
from git import Repo
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


@task
def update_all_submodules(c):
    print("Updating all submodules")
    repo = Repo(repo_base_dir)
    repo.submodule_update(init=True, recursive=True)
    print("All submodules are updated")


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
            shutil.copytree(f"{sdk_dir_path}/daprdocs/content/en/", f"{content_dir}/sdks_{sdk_dir}/")
    print("sdk content is copied")
