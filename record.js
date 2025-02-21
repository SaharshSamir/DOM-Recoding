(async function main() {
  const dmp = await import("https://cdn.jsdelivr.net/npm/diff-match-patch/+esm");

  const xhr = new XMLHttpRequest();

  const prevDomState = document.documentElement.outerHTML;
  const originalDomStatePayload = {
    type: "original-state",
    data: prevDomState
  }
  xhr.open('POST', "http://localhost:1212")
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(originalDomStatePayload);

  const observer = new MutationObserver((mutationList) => {
    const dmp = new diff_match_patch();
    //get diff
    const diff = dmp.diff_main(originalText, revisedText);

    //cleanup diff
    if (diff.length > 2) {
      dmp.diff_cleanupSemantic(diff);
    }

    //get patches
    const patch_list = dmp.patch_make(originalText, revisedText, diff);

    //apply patch
    const patched = dmp.patch_apply(patch_list, originalText);
    console.log(patched);

  })
})().then(() => console.log('ran script'));
