# Discord Expanded

This script adds bunch of random functionality to Discord desktop app:
- Mute/Unmute all servers in a folder.


## Installation

To try Discord Expanded simply run `./install.py` to install and
`./uninstall.py` to uninstall.

The changes made by this script might get overwritten by Discord update, if this
happens run `./install.py` again.

<!-- `--permament` isn't yet implemented, maybe (._.) I'll get to it sometime later.  -->
<!-- Howerver, the changes made that way won't be permament and will be overwritten
   - on the next Discord update. To prevent this from happening you have to run
   - `./install.py --permament`. This requires `asar` CLI tool as well as write
   - access to
   - `"$(dirname -- "$(realpath -- /usr/bin/discord)")"/resources/app.asar`.  Install
   - script will try to use `sudo` if it cannot access the file. To uninstall run
   - `./uninstall.py --permament`, it also requires `asar` CLI tool and will also try
   - to use `sudo`.
   -
   - If you don't want to give `sudo` access to this script you can temporarily give
   - all users write access to aformentioned file with
   - ```sh
	 -   sudo chmod go+w "$(dirname -- "$(realpath -- /usr/bin/discord)")"/resources/app.asar
   - ```
   - , run install/uninstall script, and take write access away with
   - ```sh
	 -   sudo chmod go-w "$(dirname -- "$(realpath -- /usr/bin/discord)")"/resources/app.asar
   - ```
   - .
   -
   - Even with the second method changes might get overwritten when updating Discord
   - with your package manager. You can hook into your package manager and run
   - `./install.py --permament` on every update (it's ok to run install script again
   - without running uninstall script) to prevent this. But desktop app rarely gets
   - any updates so that's not really worth the effort. -->


## TODO

- Add 2 days and 3 days as mute durations in context menu and remove "Until I
turn it back on" (it's reduntant, you can just click on "Mute Server").

- Some nice modal/settings page where user can easily view which servers are
muted as well as mute/unmute servers with input for custom mute duration.
