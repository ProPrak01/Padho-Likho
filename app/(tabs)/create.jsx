import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Camera } from "expo-camera";
import Pdf from "react-native-pdf";
import { useIsFocused } from "@react-navigation/native";
import { CameraView } from "expo-camera";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";

export default function Create() {
  const [facing, setFacing] = useState("back");
  const [permission, setPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [localPdfPath, setLocalPdfPath] = useState(null);
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
    setLocalPdfPath(null);
    setScanned(false);
  };

  const downloadPdf = async (url) => {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    try {
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      console.log("File downloaded to:", uri);
      return uri;
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert(
        "Download Error",
        "Failed to download the PDF. Please try again."
      );
      return null;
    }
  };

  const PDFViewer = ({ uri }) => {
    const source =
      Platform.OS === "ios"
        ? { uri: uri, cache: true }
        : { uri: localPdfPath, cache: false };

    return (
      <View style={styles.pdfContainer}>
        <View style={styles.pdfWrapper}>
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
            style={styles.pdf}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePdfViewer}
          >
            <Text style={styles.closeButtonText}>Close</Text>
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

  useEffect(() => {
    if (pdfUrl && Platform.OS === "android") {
      downloadPdf(pdfUrl).then((localUri) => {
        if (localUri) {
          setLocalPdfPath(localUri);
        }
      });
    }
  }, [pdfUrl]);

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
    console.log(data);
    if (data.includes(".pdf")) {
      setPdfUrl(data);
    } else {
      const decryptedUrl = decodeUrl(data);
      if (decryptedUrl && decryptedUrl.includes(".pdf")) {
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

  return (
    <View style={styles.container}>
      {(pdfUrl && Platform.OS === "ios") ||
      (localPdfPath && Platform.OS === "android") ? (
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

      {!pdfUrl && !localPdfPath && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={toggleCameraFacing}
            style={styles.flipButton}
          >
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>

          {scanned && (
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
  pdfContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECDFCC",
    width: "100%",
  },
  pdfWrapper: {
    width: "89%",
    height: "87%",
    backgroundColor: "#3C3D37",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pdf: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  closeButton: {
    padding: 20,
    backgroundColor: "#3C3D37",
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ECDFCC",
    fontSize: 20,
    fontWeight: "bold",
  },
});
