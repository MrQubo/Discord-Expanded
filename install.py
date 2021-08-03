#!/usr/bin/env python3

import logging
import os
from pathlib import Path


# `cd` to script's directory.
script_dir = Path(__file__).resolve().parent
os.chdir(script_dir)


# logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger('discord-expanded-installer')


CODE_BEGIN_INDICATOR = b'// DISCORD EXPANDED INJECT CODE BEGIN\n'
CODE_END_INDICATOR = b'// DISCORD EXPANDED INJECT CODE END'

def get_xdg_config_home():
    from os import environ

    if 'XDG_CONFIG_HOME' in environ:
        return Path(environ['XDG_CONFIG_HOME'])
    elif 'HOME' in environ:
        return Path(environ['HOME']) / '.config/'
    else:
        return Path('~/.config/').expanduser()

def find_js_paths():
    discord_config_dir = get_xdg_config_home() / 'discord/'
    paths = []
    paths += list(discord_config_dir.glob('*/modules/discord_game_utils/index.js'))
    paths += list(discord_config_dir.glob('*/modules/discord_voice/index.js'))
    if len(paths) < 1:
        raise Exception("Couldn't find js file for injection.")
    return paths

def find_js_file():
    return find_js_paths()[0].open('r+b')

def remove_code_from_js_file(js_file):
    while True:
        js_file.seek(0)
        js = bytearray(js_file.read())
        begin_idx = js.find(CODE_BEGIN_INDICATOR)
        if begin_idx < 0:
            break
        end_idx = js.index(CODE_END_INDICATOR, begin_idx+1)
        js = js[:begin_idx] + js[end_idx+len(CODE_END_INDICATOR):]
        log.info(f'Removing code from file {js_file.name}...')
        js_file.seek(0)
        js_file.write(js)
        js_file.truncate()

def inject_code_into_js_file(js_file):
    inject_code = bytearray(CODE_BEGIN_INDICATOR)
    with open('./discord-expanded.js', 'rb') as f:
        inject_code += f.read()
    inject_code += CODE_END_INDICATOR

    log.info(f'Injecting code into file {js_file.name}...')
    js_file.seek(0, 2)  # seek to the end
    js_file.write(inject_code)

def uninstall():
    js_file = args.js_file
    if js_file is None:
        for js_path in find_js_paths():
            js_file = js_path.open('r+b')
            remove_code_from_js_file(js_file)
    else:
        remove_code_from_js_file(js_file)

def install():
    js_file = args.js_file
    if js_file is None:
        js_file = find_js_file()

    remove_code_from_js_file(js_file)
    inject_code_into_js_file(js_file)


def main(cb):
    from argparse import ArgumentParser, FileType

    parser = ArgumentParser()
    parser.add_argument('--js-file', type=FileType('r+b'), help="Some Discord's js file where our code will be injected.")

    global args
    args = parser.parse_args()

    cb()

if __name__ == '__main__':
    main(install)
