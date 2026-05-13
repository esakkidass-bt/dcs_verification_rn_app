// import {
//   CropClassificationOfflineProps,
//   CropOfflineProps,
//   CropTypeOfflineProps,
//   HandleDownloadProgressFunction,
//   IUser,
//   MiscCroppingMethodOfflineProps,
//   MiscCropSeasonTypeOfflineProps,
//   MiscCropStageOfflineProps,
//   MiscIrrigationSourceOfflineProps, WebLinkOfflineProps,
// } from "../../@types";
// import api from "../../api";

// interface Props {
//   userId: IUser["userId"];
//   deviceId: string
//   handleDownloadProgress :HandleDownloadProgressFunction

// }

// const index = async ({userId, deviceId, handleDownloadProgress}: Props) => {



//   await api.local.apiTimestamp.compare({
//     apiName: 'web_links', callback: async ({needToUpdate}) => {
//       if (needToUpdate) {
//   handleDownloadProgress('webLinks', 'downloading')
//         const links = await api.webLink.getWebLink({
//           userId,
//           deviceId
//         });
        
//         let linksParsed: WebLinkOfflineProps[] = [];

//         // change keywords in cropTypes list
//         if (links && links?.length > 0) {
//           linksParsed = links?.map((e) => {
//             return {
//               webLinkid: e.web_link_id?.toString().replaceAll(/'/g, '~'),
//               webLink: e.web_link,
//               displayName: e.display_name.replaceAll(/'/g, '~'),
//             };
//           });
//         }
        
//         await api.local.webLink.store({ data: linksParsed});

//         if(linksParsed?.length>0){
//           handleDownloadProgress('webLinks', 'completed')
//         }else{
//           handleDownloadProgress('webLinks', 'failed')
//         }
//       } else {
//         handleDownloadProgress('webLinks', 'completed')
//       }
//     }
//   })
  
// };

// export default index;
