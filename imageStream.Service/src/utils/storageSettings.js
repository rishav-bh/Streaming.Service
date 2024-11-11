import dotenv from "dotenv"
dotenv.config();
/*global process*/ 
export const StorageSettings = {
  isDebugMode: false,
  containerName: "communitypost",
  plantDoctorContainer: "",
  stageContainer: "",
  userContainer: "",
  accountUrl: "",
  connectionString: "DefaultEndpointsProtocol=https;AccountName=bighaatdevnewblob;AccountKey=DxXvwyVCRU8dAtPDqw0url5siB5KsFi2CQlKyuedDK+Gr4c6oOeXyyo2409SdueY5yv1yZP2tWfj+ASt481+rQ==;EndpointSuffix=core.windows.net",
  bannerContainer: process.env.AZURE_CONTAINER_NAME,
  uploadLoadContainer: "",
  bsStageContainer: "",
  videosContainer: "",
  adContainerName: "",
  adStageContainer: "",
  blobRequestOptions: {
    parallelOperationThreadCount: null,
    storeBlobContentMD5: false,
    retryCount: 0,
    backOffPeriodInSeconds: 0,
  },
};
