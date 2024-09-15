import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import { useIsFocused } from "@react-navigation/native";

export default function ImageScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedImages, setScannedImages] = useState([]);
  const [pdfName, setPdfName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
          exif: false,
          quality: 1,
          format: "jpeg",
        });

        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
        );

        setScannedImages([...scannedImages, manipResult.uri]);
      } catch (error) {
        console.error("Error capturing image:", error);
        Alert.alert("Error", "Failed to capture image. Please try again.");
      }
    }
  };

  const promptForPdfName = () => {
    setModalVisible(true);
  };

  const handleCreatePDF = () => {
    if (pdfName && pdfName.trim() !== "") {
      setModalVisible(false);
      createPDF(pdfName.trim());
    } else {
      Alert.alert("Invalid Name", "Please enter a valid name for your PDF.");
    }
  };

  const createPDF = async (name) => {
    if (scannedImages.length === 0) {
      Alert.alert(
        "No images",
        "Please capture at least one image before creating a PDF."
      );
      return;
    }

    try {
      const imageAssets = await Promise.all(
        scannedImages.map(async (uri) => {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:image/jpeg;base64,${base64}`;
        })
      );

      const html = `
        <html>
          <body>
            <h1>${name}</h1>
            ${imageAssets
              .map(
                (base64) =>
                  `<img src="${base64}" style="width: 100%; height: auto; margin-bottom: 20px; max-width: 800px;" />`
              )
              .join("")}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const pdfUri = `${FileSystem.documentDirectory}${name}.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });
      console.log(`PDF created at: ${pdfUri}`);
      Alert.alert("Success", `PDF "${name}" created successfully!`);
      setScannedImages([]);
      setPdfName("");
    } catch (error) {
      console.error("Error creating PDF:", error);
      Alert.alert("Error", "Failed to create PDF. Please try again.");
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={"back"}
          imageType={"jpg"}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={captureImage}>
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      <View style={styles.footer}>
        <Text style={styles.imageCount}>Images: {scannedImages.length}</Text>
        <TouchableOpacity
          style={styles.createPdfButton}
          onPress={promptForPdfName}
        >
          <Text style={styles.buttonText}>Create PDF</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.thumbnailContainer}>
        {scannedImages.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.thumbnail} />
        ))}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter a name for your PDF</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPdfName}
              value={pdfName}
              placeholder="PDF Name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreatePDF}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  imageCount: {
    color: "white",
    fontSize: 16,
  },
  createPdfButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  thumbnailContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    margin: 5,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    width: 200,
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  modalButton: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F194FF",
  },
  createButton: {
    backgroundColor: "#2196F3",
  },
});
