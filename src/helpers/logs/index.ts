import * as FileSystem from 'react-native-fs';

const writeLogToFile = async ({
  message,
  _fileName,
}: {
  message: string;
  _fileName?: 'cropSurvey_sqlLog' | 'uploadSurvey' | 'app';
}) => {
  try {
    const directory = FileSystem.DocumentDirectoryPath + '/logs';
    const fileName = `${_fileName || 'app'}.log`;
    const filePath = directory + '/' + fileName;

    // Ensure the directory exists
    await FileSystem.mkdir(directory);

    // Check if the file exists
    const fileExists = await FileSystem.exists(filePath);
    let prevData = '';
    if (fileExists) {
      prevData = await FileSystem.readFile(filePath);
    }

    const formattedMessage = `${new Date().toLocaleString()} - ${message}`;

    // Write to the file
    await FileSystem.writeFile(
      filePath,
      fileExists ? `${prevData}\n\n${formattedMessage}` : formattedMessage, // Append if file
      // exists
      'utf8',
    );

    console.log('Log written to file successfully');
  } catch (error) {
    console.error('Error writing log to file:', error);
  }
};

const getLogFilePath = async (_fileName: string) => {
  try {
    const directory = FileSystem.DocumentDirectoryPath + '/logs';
    const fileName = `${_fileName}.log`;
    const filePath = directory + '/' + fileName;

    // Check if the file exists

    if (await FileSystem.exists(filePath)) {
      return filePath;
    } else {
      return null; // File does not exist
    }
  } catch (error) {
    console.error('Error getting log file path:', error);
    return null;
  }
};

const clearLogFile = async (_fileName: string) => {
  try {
    const directory = FileSystem.DocumentDirectoryPath + '/logs';
    const fileName = `${_fileName}.log`;
    const filePath = directory + '/' + fileName;

    // Ensure the directory exists
    await FileSystem.mkdir(directory);

    // Clear the content of the file
    await FileSystem.writeFile(filePath, '', 'utf8');

    console.log('Log file content cleared successfully');
  } catch (error) {
    console.error('Error clearing log file content:', error);
  }
};

const logs = {
  writeLogToFile,
  getLogFilePath,
  clearLogFile,
};

export default logs;
