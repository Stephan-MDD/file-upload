import React, { useState } from 'react';
import { Button, Platform, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

/* Info
- free video samples https://sample-videos.com/ [web, native]
*/

export default function ImagePickerExample() {
	const [file, setFile] = useState(null);

	const handleFileSelection = async () => {
		const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
		if (result.cancelled) return console.warn('Selection was cancelled');
		setFile(result);
	};

	const handleNativeSubmit = async () => {
		let filePath = `file://${file.uri}`;
		filePath = filePath.replace('%40', '%2540');
		filePath = filePath.replace('%2F', '%252F');

		await FileSystem.uploadAsync('http://192.168.0.33:4000', filePath, {
			uploadType: FileSystem.FileSystemUploadType.MULTIPART,
			fieldName: 'file',
			parameters: { fileName: file.name, fileExtension: file.name.replace(/^.+\./, '') },
		});
	};

	const handleWebSubmit = async () => {
		const uriRegex = /^data:(?<mimetype>\w+\/\w+);base64,(?<base64>.+)$/gm;
		const uriRegexResult = uriRegex.exec(file.uri);

		const byteString = atob(uriRegexResult.groups.base64);
		const mimeString = uriRegexResult.groups.mimetype;
		const bytes = new Uint8Array(byteString.length);

		for (let index = 0; index < byteString.length; index++) {
			bytes[index] = byteString.charCodeAt(index);
		}

		const fileBlob = new Blob([bytes], { type: mimeString });
		const formData = new FormData();

		formData.append('file', fileBlob);
		formData.append('fileName', file.name);
		formData.append('fileExtension', file.name.replace(/^.+\./, ''));

		await fetch('http://localhost:4000', { method: 'POST', body: formData });
	};

	const handleSubmit = () => {
		Platform.OS === 'web' ? handleWebSubmit() : handleNativeSubmit();
		setFile(null);
	};

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Button title="Select file" onPress={handleFileSelection} />
			<View style={{ height: 12 }} />
			<Button title={`Submit file: ${file?.name ?? ''}`} onPress={handleSubmit} disabled={!file} color="#0CC" />
		</View>
	);
}
