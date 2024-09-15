import React from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

const QRCodeGenerator = ({ prop }) => {
  const [url, setUrl] = React.useState("");
  const [qrCodeValue, setQrCodeValue] = React.useState("");

  const generateQRCode = () => {
    setQrCodeValue(url);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={prop}
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Generate QR Code" onPress={generateQRCode} />
      {qrCodeValue ? (
        <View style={styles.qrCodeContainer}>
          <QRCode value={qrCodeValue} size={200} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 8,
  },
  qrCodeContainer: {
    marginTop: 16,
  },
});

export default QRCodeGenerator;
