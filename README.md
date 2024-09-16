# Padho-Likho

**Padho-Likho** is an innovative mobile app designed for educational purposes and secure note sharing. Developed using React Native and Expo, the app integrates advanced features such as computer vision, QR code scanning, and PDF management to enhance the way users create, share, and interact with educational materials.

## Features

### PDF Creation and Management
- **Image to PDF Conversion**: Capture images and convert them into PDFs directly within the app.
- **Secure PDF Storage**: Upload PDFs to Cloudinary with encryption, ensuring that sensitive information remains secure.
- **Encrypted QR Codes**: Generate encrypted QR codes for uploaded PDFs. The links to the PDFs are hidden from the user and only accessible through the QR codes.



### QR Code Functionality
- **QR Scanning**: Scan QR codes to access encrypted PDFs. The app will decrypt the PDFs and display them in a read-only mode, preventing screenshots and unauthorized access.

### Chat Functionality
- **Public and Private Channels**: Engage in text-based chats through public and private channels. Future updates will include video messaging capabilities.


## for example
- you can scan the given qr code with any other app or camera it will return a code text but when scanned with this app , it will open a pdf in thee app.
as the app decripts the pdf
<p align="center">
  <img src="./images/temphack1.png" width="350" title="hover text">
</p>

- video preview of pdf creation and qr code generation:
[![Everything Is AWESOME](https://img.youtube.com/vi/StTqXEQ2l-Y/0.jpg)](https://www.youtube.com/watch?v=StTqXEQ2l-Y "Everything Is AWESOME")


## Tech Stack

- **React Native**: For building the mobile app.
- **Expo**: For app development and deployment.
- **Cloudinary**: For PDF storage and management.
- **CryptoJS**: For encryption and decryption of PDF links.
- **Stream-Chat-Expo**: For implementing chat features.
- **Various Expo Modules**: Such as `expo-camera`, `expo-barcode-scanner`, and `expo-file-system` for core functionalities.

## Installation

To get started with Padho-Likho, clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/padho-likho.git
cd padho-likho
yarn install
```
## Running the App
### To start the development server and run the app on different platforms:

Start Development Server ios : 
```bash
npx expo run:ios --device
```
Start Development Server android : 
```bash
npx expo run:ios --android
```
### Direct Download Apk and aab is available :
Download Apk file link: 
```bash
https://expo.dev/accounts/proprak/projects/padho-likho/builds/24af0ab0-5868-4a2b-9058-94db58beb537
```
Start Development Server android : 
```bash
npx expo run:ios --android
```
## Dependencies

Below is a list of key dependencies used in this project:

| **Package**                            | **Version** |
|----------------------------------------|-------------|
| `@react-native-camera-roll/camera-roll` | ^7.8.3      |
| `@react-native-community/geolocation`   | ^3.2.1      |
| `expo-camera`                          | ~15.0.16    |
| `expo-barcode-scanner`                 | ~13.0.1     |
| `expo-file-system`                     | ~17.0.1     |
| `react-native-qrcode-svg`              | ^6.3.2      |
| `crypto-js`                            | ^4.2.0      |
| `stream-chat-expo`                     | ^5.37.0     |

## Future Implications
We welcome contributions to Padho-Likho! To contribute, fork the repository, make your changes, and submit a pull request.

## License
This project is licensed under the Apache-2.0 license. See the LICENSE file for more information.

## Acknowledgements
Webops & Blockchain Club for providing a good platform for this hackathon , we got to learn very much from it.
Expo: For providing a comprehensive development framework.
Cloudinary: For efficient file management and secure storage solutions.
Stream-Chat: For the robust chat functionalities.
