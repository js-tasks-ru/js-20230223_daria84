const IMGUR_CLIENT_ID = "28aaa2e823b03b1";

// throws FetchError if upload failed
// NOTE: check https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker

export default class ImageUploader {
  static async upload(file) {
    const formData = new FormData(); // <form name="baz" ...

    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: "",
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
