(async function main() {
  const { diff_match_patch } = await import("https://cdn.jsdelivr.net/npm/diff-match-patch/+esm");

  const dmp = new diff_match_patch();
  const xhr = new XMLHttpRequest();

  let prevDomState = document.documentElement.outerHTML;
  const originalDomStatePayload = {
    type: "original-state",
    data: prevDomState
  }
  xhr.open('POST', "http://localhost:1212")
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(originalDomStatePayload));

  const observer = new MutationObserver((mutationList) => {
    const currentDom = document.documentElement.outerHTML;
    //get diff
    const diff = dmp.diff_main(prevDomState, currentDom);

    //cleanup diff
    if (diff.length > 2) {
      dmp.diff_cleanupSemantic(diff);
    }

    //get patches
    const patch_list = dmp.patch_toText(dmp.patch_make(prevDomState, currentDom, diff));

    const patchPayload = {
      type: "patch",
      data: patch_list
    }

    //send patch to server
    xhr.open('POST', "http://localhost:1212")
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(patchPayload));


    prevDomState = currentDom;

  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
    attributeOldValue: true,
    characterDataOldValue: true
  });
})().then(() => console.log('ran script'));
