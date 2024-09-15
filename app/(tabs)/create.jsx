import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Camera } from "expo-camera";
import Pdf from "react-native-pdf";
import { useIsFocused } from "@react-navigation/native";
import { CameraView } from "expo-camera";
import { Buffer } from "buffer";

export default function Create() {
  
  const [facing, setFacing] = useState("back");
  const [permission, setPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // To store the Cloudinary PDF URL
  const isFocused = useIsFocused();

  const decodeUrl = (encodedUrl) => {
    try {
      const decodedUrl = Buffer.from(encodedUrl, "base64").toString("utf8");
      return decodedUrl;
    } catch (error) {
      console.error("Decoding error:", error);
      return null;
    }
  };

  const handleClosePdfViewer = () => {
    setPdfUrl(null);
    setScanned(false);
  };
  const PDFViewer = ({ uri }) => {
    const source = { uri: uri, cache: true };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ECDFCC", // Dark overlay for focus
          width: "100%",
        }}
      >
        <View
          style={{
            width: "89%",
            height: "87%", // Adjust height as necessary
            backgroundColor: "#3C3D37", // Light background
            borderRadius: 20, // Rounded corners
            overflow: "hidden", // Ensure borders are clean
            shadowColor: "#000", // Optional shadow for elevation
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5, // For Android shadow
          }}
        >
          <Pdf
            source={source}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              console.log(error);
            }}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: "#fff", // Add light padding for a clean look
            }}
          />
          <TouchableOpacity
            style={{
              padding: 20,
              backgroundColor: "#3C3D37",
              alignSelf: "center",
              width: "100%",
              alignItems: "center",
            }}
            onPress={handleClosePdfViewer}
          >
            <Text
              style={{ color: "#ECDFCC", fontSize: 20, fontWeight: "bold" }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setPermission(cameraStatus.status === "granted");
    })();
  }, []);

  if (permission === null) {
    return <View />;
  }

  if (permission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          onPress={() => Camera.requestCameraPermissionsAsync()}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // setPdfUrl(data);
    console.log(data);
    if (data.includes(".pdf")) {
      // Set the PDF URL to be displayed
      setPdfUrl(data);
    } else {
      const decryptedUrl = decodeUrl(data);
      if (decryptedUrl.includes(".pdf")) {
        setPdfUrl(decryptedUrl);
      } else {
        Alert.alert(
          "Invalid QR",
          "This QR code does not contain a valid PDF link."
        );
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  //   <BarCodeScanner
  //   onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
  //   style={StyleSheet.absoluteFillObject}
  //   facing={facing}
  // />
  //pdfUrl
  return (
    <View style={styles.container}>
      {/* Show PDF if the URL is available */}
      {pdfUrl ? (
        <PDFViewer uri={pdfUrl} />
      ) : (
        isFocused && (
          <CameraView
            facing={facing}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
        )
      )}

      {/* Controls */}
      {!pdfUrl && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={toggleCameraFacing}
            style={styles.flipButton}
          >
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>

          {scanned && !pdfUrl && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={styles.scanAgainButton}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  flipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 25,
  },
  scanAgainButton: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
