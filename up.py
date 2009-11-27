#!/usr/bin/env python

# up.py - Uploads the game to a given FTP server
# Usage:
#  up.py host name pass [to_dir]

from getpass import getpass
from ftplib import FTP, error_perm
from optparse import OptionParser
import sys

class MessageManager:
  def __init__(self, verboselevel=1):
    self.verboselevel = verboselevel
  def msg(self, msg, verboselevel=1):
    if verboselevel <= self.verboselevel:
      print msg

###   Main starts here   ###

parser_usage = "%prog action [options]"
"Modifies files listed in the config as specified by the action-argument"
parser_version = "%prog 0.1"
parser = OptionParser(usage=parser_usage, version=parser_version)
parser.add_option("-c", "--config",
                  dest="config", default="up.conf",
                  help="load the given config file in addition to the "
                  "default one [default: up.conf]")
parser.add_option("-d", "--destination",
                  dest="dest",
                  help="the remote destination folder")
parser.add_option("-r", "--host",
                  dest="host",
                  help="the (remote) hostname to connect to")
parser.add_option("-n", "--no-config",
                  action="store_true", dest="noconfig", default=False,
                  help="use the default config only [default: false]")
parser.add_option("-p", "--port",
                  dest="port",
                  help="the port to connect to")
parser.add_option("-q", "--quiet",
                  action="store_false", dest="verbose",
                  help="be quiet [default: false]")
parser.add_option("-u", "--user",
                  dest="user",
                  help="the username")
parser.add_option("-v", "--verbose",
                  action="store_true", dest="verbose", default=True,
                  help="be verbose [default: true]")
parser.add_option("-w", "--password",
                  dest="password",
                  help="the user's password")
                  
(parser_opts, parser_args) = parser.parse_args()

if len(parser_args) < 1:
  parser.error("You must specify an action as the first argument")

# Otherwise:
action = parser_args[0]

if not action == "upload" and not action == "install"\
and not action == "remove":
  parser.error("Invalid action; use install or remove to install or remove "
               "stuff")

if parser_opts.verbose:
  msgr = MessageManager(1)
else:
  msgr = MessageManager(0)


# Reset all remote vars before parsing a thing
remotefolder = None
remotehost = None
remoteport = None
remoteuser = None
remotepassword = None


execfile("up.default.conf")

if parser_opts.config and not parser_opts.noconfig:
  execfile(parser_opts.config)

if not remotefiles or len(remotefiles) == 0:
  parser.error("No remotefiles variable specified in any config parsed")


if parser_opts.dest:
  remotefolder = parser_opts.dest

if parser_opts.host:
  remotehost = parser_opts.host

if parser_opts.port:
  remoteport = parser_opts.port

if parser_opts.user:
  remoteuser = parser_opts.user

if parser_opts.password:
  remotepassword = parser_opts.password


if not remotehost:
  remotehost = raw_input("Host: ")

if not remoteuser:
  remoteuser = raw_input("User: ")

if not remotepassword:
  remotepassword = getpass("Password: ")

if not remotefolder:
  remotefolder = raw_input("Folder: ")
  if remotefolder == "":
    remotefolder = "/"

if remotefolder[len(remotefolder)-1] != "/":
  remotefolder += "/"

# Collecting data ends here
print ""

# Networking starts here
msgr.msg("Connecting...", 1)

if remoteport:
  ftp_conn = FTP(remotehost, remoteport)
else:
  ftp_conn = FTP(remotehost)

msgr.msg("Logging in...", 1)

try:

  ftp_conn.login(remoteuser, remotepassword)

  if action == "upload" or action == "install":
    try:
      ftp_conn.cwd(remotefolder)
    except error_perm, err:
      if str(err)[0:3] == "550":
        ftp_conn.mkd(remotefolder)
        ftp_conn.cwd(remotefolder)
      else:
        raise(err)
        
    for curfile in remotefiles:
      msgr.msg("Uploading " + remotefolder + curfile + "...", 1)
      ftp_conn.storlines("stor " + curfile, open(curfile))
  
  elif action == "remove":
    try:
      ftp_conn.cwd(remotefolder)
      for curfile in remotefiles:
        msgr.msg("Deleting " + remotefolder + curfile + "...", 1)
        ftp_conn.delete(curfile)
      ftp_conn.cwd("..")
      ftp_conn.rmd(remotefolder)
    except error_perm, err:
      if str(err)[0:3] == "550":
        msgr.msg("Nothing to remove.", 1)
      else:
        raise(err)

finally:
  try:
    ftp_conn.quit()
  except:
    pass

msgr.msg("Exiting...")

exit()

