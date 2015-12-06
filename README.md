
PoliformaT
----------

This is the code of a Chrome extension aimed at enhancing the use of
UPV (Universitat Politécnica de València)'s virtual campus. It
provides a (poorly designed) graphical interface for navigating the
user's courses' folders and downloading files.

Usage
-----

The following scripts are available:

        $ npm run build # Build the extension without source maps
        $ npm run watch # Build the extension and watch for changes (with source maps)
        $ npm run cover # Generate test coverage in coverage folder
        $ npm test      # Run test suite

In order for any of them to work, you must previously run:

        $ npm install   # Install project dependencies in node_modules folder

Having a recent version of NPM installed.

Keep in mind that the extension files are in the **extension**
folder. Root folder is for project files (test, coverage,
dependencies, etc.).

Login
-----

There is the option to store login credentials in the extension. Be
warned that none of this data is encrypted or hashed and will probably
be stored as plain text by Chrome.

If you were to store your credentials using the aforementioned
feature, the extension will attempt to log in periodically (unless it
detects you are already logged in) to keep you identified in
PoliformaT (and thus, the whole UPV network) all the time. I find this
very useful, since I no longer have to log in everytime I have to look
up something or download a file in PoliformaT.

Improvements
------------

Feel free to open an issue or a pull request if you feel any of the
features doesn't work as intended.

I am uploading the code to Github so anyone can improve upon it or use
the code for their own purposes (mind the license). After June 2016 I
won't be maintaining this code anymore.

Licensing
---------

This code is distributed under the GPLv3 license, which can be found in the following link:
http://www.gnu.org/licenses/gpl.html
