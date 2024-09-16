

#  Padho-Likho

<p align="center">
  <img src="./images/logo_main.png" width="150" title="logo">
</p>

**Padho-Likho** is an innovative mobile app designed for educational purposes and secure note sharing. Developed using React Native and Expo, the app integrates advanced features such as computer vision, QR code scanning, and PDF management to enhance the way users create, share, and interact with educational materials. with chat feature


## Contributor:
self (ed22b059) Prakash Kumar Jha (only)

## Features

### PDF Creation and Management
- **Image to PDF Conversion**: Capture images and convert them into PDFs directly within the app utilizing photo aligning and resizing.
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


[![Everything Is AWESOME](https://img.youtube.com/vi/Jj0kmasN5K0/0.jpg)](https://www.youtube.com/watch?v=Jj0kmasN5K0)


- video preview of qr code scanning:
https://drive.google.com/file/d/15R2CG9p5Hjz4V4ABCj3N62bB1ES5Zgq_/view?usp=sharing

## Flowcart of working in details:
<p align="center">
  <img src="./images/flowchart.png" width="700" title="hover text">
</p>
link: https://drive.google.com/file/d/1zZGkErONCO3FBRjroRRIcqvvgA0SQTCF/view?usp=sharing

## Tech Stack
- **Appwrite**: For backend tasks (user auth , live chat , etc)
- **React Native**: For building the mobile app.
- **Expo**: For app development and deployment.
- **Cloudinary**: For PDF storage and management.
- **CryptoJS**: For encryption and decryption of PDF links.
- **Various Expo Modules**: Such as `expo-camera`, `expo-barcode-scanner`, and `expo-file-system` for core functionalities.

## Installation

### (best to view in IOS (as it was developed using it) , instructions provided below)


### Direct Download Apk and aab is available :
Download Apk file link: 
```bash
https://expo.dev/accounts/proprak/projects/padho-likho/builds/24af0ab0-5868-4a2b-9058-94db58beb537
```

Download aab file link: 
```bash
https://drive.google.com/file/d/1armx70IW0bPkxlPhHIfSM24AeI3cpyzR/view?usp=sharing
```



To get started with Padho-Likho, clone the repository and install the dependencies:
(ensure expo is installed)
```bash
git clone https://github.com/ProPrak01/Padho-Likho.git
cd padho-likho
npm install
```
## Running the App
### To start the development server and run the app on different platforms:
(more detailed info : https://docs.expo.dev/)


Start Development Server ios : (CocoaPods is prerequisit)
```bash
cd ios
pod install
cd ..
```

```bash
npx expo run:ios --device
```
Start Development Server android : 
```bash
npx expo run:android --device
```

or scan the qr in mobile phone :

<p align="center">
  <img src="./images/qrdownload.png" width="350" title="hover text">
</p>


Start Development Server ios : 
```bash
npx expo run:ios --device
```
build file of ios app could not be provided due to some constraints

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
Implementing video sending and streaming (content related to doubt solving , etc. in the chat)

## License
This project is licensed under the Apache-2.0 license. See the LICENSE file for more information.

## Acknowledgements
Webops & Blockchain Club for providing a good platform for this hackathon , we got to learn very much from it.
Expo: For providing a comprehensive development framework.
Cloudinary: For efficient file management and secure storage solutions.
Stream-Chat: For the robust chat functionalities.
