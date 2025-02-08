return {
  "nvim-telescope/telescope.nvim",
  dependencies = {
    "nvim-telescope/telescope-live-grep-args.nvim",
  },
  config = function(plugin, opts)
    require "astronvim.plugins.configs.telescope"(plugin, opts)
    require("telescope").load_extension "live_grep_args"
  end,
}
