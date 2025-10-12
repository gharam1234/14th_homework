export const checkFileValidation = (file?: File) => {
  if (typeof file === "undefined") {
    alert("파일이 없습니다. 파일을 선택해주세요.");
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5MB
    alert("파일 용량이 너무 큽니다. 5MB 이하로 업로드 해주세요.");
    return false;
  }

  if (
    !file.type.includes("jpeg") &&
    !file.type.includes("png")
  ) {
    alert("jpeg, png 파일만 업로드 가능합니다.");
    return false;
  }
  return true;
};
