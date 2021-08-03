#!/usr/bin/env python3

if __name__ != '__main__':
    raise Exception("This file shouldn't be imported.")

from install import main, uninstall
main(uninstall)
