import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import Pdf from "react-native-pdf";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

const Home = () => {
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  const qrCodeRef = useRef(null);

  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);

  const [qrCodeValue, setQrCodeValue] = useState("");
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === "granted");
    })();
  }, []);
  const saveQrCodeToGallery = async () => {
    if (!hasMediaLibraryPermission) {
      alert("Permission to access gallery is required.");
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === "granted");
      return;
    }

    try {
      const uri = await captureRef(qrCodeRef, {
        format: "png",
        quality: 1.0,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("QR code saved to gallery!");
    } catch (error) {
      console.error("Error saving QR code:", error);
      alert("Failed to save QR code.");
    }
  };

  const generateQRCode = () => {
    setQrCodeValue(url);
  };

  const loadPDFs = async () => {
    try {
      const documentsDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(documentsDir);
      const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

      const pdfData = await Promise.all(
        pdfFiles.map(async (file, index) => {
          const fileInfo = await FileSystem.getInfoAsync(documentsDir + file);

          return {
            id: index.toString(),
            name: file.replace(".pdf", ""),
            fileName: file,
            date: new Date(fileInfo.modificationTime * 1000)
              .toISOString()
              .split("T")[0],
            uri: fileInfo.uri,
          };
        })
      );

      setPdfs(pdfData);
    } catch (error) {
      console.error("Error loading PDFs:", error);
    }
  };

  useEffect(() => {
    loadPDFs();
  }, []);

  const filteredPdfs = pdfs.filter(
    (pdf) =>
      pdf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uploadToCloudinary = async (uri) => {
    const cloudName = "dv9m6ghqf";
    const uploadPreset = "pdfshack";
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`; // Use 'auto' instead of 'upload' for PDFs and other file types.

    const formData = new FormData();
    formData.append("file", {
      uri: uri, // The URI of the PDF file.
      type: "application/pdf", // The correct MIME type for a PDF.
      name: `${uri}.pdf`, // The name to assign the uploaded file.
    });
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        return data.secure_url; // Return the secure URL of the uploaded PDF.
      } else {
        throw new Error(data.error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handlePdfPress = (item) => {
    setSelectedPdf(item);
    setModalVisible(true);
  };

  const handlePdfPreviewPress = () => {
    setPdfViewerVisible(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerVisible(false);
    setModalVisible(false);
  };

  const handleUpload = async () => {
    try {
      setModalVisible(false);
      const url = await uploadToCloudinary(selectedPdf.uri);
      setUploadedUrl(url);
      setQrCodeValue(url);
      setQrCodeModalVisible(true);
      Alert.alert(
        "Upload Successful",
        `Your PDF has been uploaded. URL: ${url}`,
        [{ text: "OK", onPress: () => setUploadedUrl(null) }]
      );
    } catch (error) {
      Alert.alert(
        "Upload Failed",
        "An error occurred while uploading the PDF."
      );
    }
  };

  const renderPdfItem = ({ item }) => (
    <TouchableOpacity
      className="bg-[#3C3D37] border-[#1E201E] border-2 mx-3 p-4 rounded-lg mb-2"
      onPress={() => handlePdfPress(item)}
    >
      <Text className="text-lg text-white font-psemibold">{item.name}</Text>
      <Text className="text-sm text-gray-300">{item.fileName}</Text>
      <Text className="text-xs text-gray-400 mt-1">{item.date}</Text>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPDFs().then(() => setRefreshing(false));
  }, []);

  const PDFViewer = ({ uri }) => {
    const source = { uri: uri, cache: true };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ECDFCC", // Dark overlay for focus
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

  return (
    <SafeAreaView className="bg-[#1E201E] h-full">
      <View className="my-6 px-4 space-y-6">
        <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-300">Welcome</Text>
            <Text className="text-2xl font-psemibold text-[#ECDFCC]">
              {user.username}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC] bg-[#3C3D37]"
            onPress={() => {
              router.push("/create");
            }}
          >
            <Text className="text-[#ECDFCC] font-pbold">Scan QR</Text>
          </TouchableOpacity>
        </View>
        <SearchInput value={searchQuery} handleChangeText={setSearchQuery} />
        <View className="w-full pt-5 flex-1 pb-8">
          <Text className="text-gray-100 text-lg font-pregular mb-4">
            Your PDFs
          </Text>
        </View>
      </View>
      <FlatList
        data={filteredPdfs}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.id}
        // ListHeaderComponent={() => (

        // )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No PDFs Found"
            subtitle="Scan your first document to get started!"
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ffffff"]}
            tintColor="#ffffff"
          />
        }
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-[#3C3D37]">
          <View className="bg-[#ECDFCC] p-6 rounded-lg">
            {!pdfViewerVisible ? (
              <>
                <TouchableOpacity
                  onPress={handlePdfPreviewPress}
                  className="items-center mb-6 border-2 bg-[#3C3D37] rounded-md p-2"
                >
                  <Image
                    source={{ uri: selectedPdf?.uri }}
                    style={{
                      height: 150,
                      width: 150,
                      resizeMode: "contain",
                      marginBottom: 10,
                    }}
                  />
                  <Text className="text-md text-accent text-[#ECDFCC]">
                    View PDF
                  </Text>
                </TouchableOpacity>

                <Text className="text-lg font-bold mb-2">Upload PDF</Text>
                <Text className="mb-6">
                  Do you want to send this PDF online?
                </Text>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="bg-blue-500 py-3 px-5 rounded-md border-2 border-[#1E201E]"
                    onPress={handleUpload}
                  >
                    <Text className="text-white font-bold">Yes, Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-[#3C3D37] py-3 px-5 rounded-md "
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="font-bold text-[#ECDFCC]">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View
                style={{
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").height,
                }}
              >
                {selectedPdf && <PDFViewer uri={selectedPdf.uri} />}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* <Modal
        animationType="slide"
        transparent={false}
        visible={pdfViewerVisible}
        onRequestClose={() => setPdfViewerVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: "#f0f0f0",
              alignSelf: "flex-end",
            }}
            onPress={() => setPdfViewerVisible(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
          {selectedPdf && <PDFViewer uri={selectedPdf.uri} />}
        </View>
      </Modal> */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrCodeModalVisible}
        onRequestClose={() => setQrCodeModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg items-center">
            <Text className="text-lg font-pbold mb-4">
              QR Code for Your PDF
            </Text>
            {/* Ref to capture QRCode */}
            <View ref={qrCodeRef} className="mb-4">
              <QRCode value={qrCodeValue} size={200} />
            </View>
            <Text className="mt-4 mb-2 text-center">
              Scan this QR code to access your PDF
            </Text>

            {/* Save QR Code Button */}
            <TouchableOpacity
              className="bg-green-500 py-2 px-4 rounded-md mb-2"
              onPress={saveQrCodeToGallery}
            >
              <Text className="text-white font-pbold">Save QR Code</Text>
            </TouchableOpacity>

            {/* Close Modal Button */}
            <TouchableOpacity
              className="bg-accent py-2 px-4 rounded-md mt-4"
              onPress={() => setQrCodeModalVisible(false)}
            >
              <Text className="text-black font-pbold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
