
1. create a private key
openssl genrsa -aes256 -out localhost.key 2048
// you will be prompted to provide a password
//this will create localhost.key (call it whatever you like)

2. create the certificate
openssl req -days 3650 -new -newkey rsa:2048 -key localhost.key -x509 -out localhost.pem 
//you will be prompted for the password from above
//you will have to complete the various prompts
//this will create localhost.pem (call it whatever you like)

3. Create a .vscode folder in the root of your project
4. Create a settings.json file inside the .vscode folder.
5. Add the following to the settings.json file
{
  "liveServer.settings.port": 5501,
  "liveServer.settings.root": "/",
  "liveServer.settings.CustomBrowser": "chrome",
  "liveServer.settings.https": {
    "enable": true,
    "cert": "/Users/steve/Documents/code/https/localhost.pem",
    "key": "/Users/steve/Documents/code/https/localhost.key",
    "passphrase": "12345"
  }
}
6. Adjust the location of the .pem certificate and the .key files.
7. Update the passphrase to be the password you used when creating the key