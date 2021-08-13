# add-workflows-in-mdfile.yml

A deno script that will automatically add all manually dispatchable workflows
into a nice little table within your root readme file.

## How to use?

1. Copy
   [the following workflow file](https://github.com/xdrdak/add-workflows-to-mdfile/blob/main/.github/workflows/add-workflows-in-mdfile.yml)
   into your repository's `./github/workflows` folder as is.
1. Read the workflow file carefully as you will need to setup some sections to
   enable automated PR creations and such.
1. Add `<!--actions-begin--><!--actions-end-->` in your markdown file so the
   script knows where to inject the table.
