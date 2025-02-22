(async function main() {

  const { diff_match_patch } = await import("https://cdn.jsdelivr.net/npm/diff-match-patch/+esm");

  const dmp = new diff_match_patch();
  const xhr = new XMLHttpRequest();

  //store the original state of the dom
  let prevDomState = document.documentElement.outerHTML;
  const originalDomStatePayload = {
    type: "original-state",
    data: prevDomState
  }
  //and send it to the server (original-state.html is made)
  xhr.open('POST', "http://localhost:1212")
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(originalDomStatePayload));

  //start observing changes
  const observer = new MutationObserver((mutationList) => {
    console.log('mutation list: ', mutationList);
    const currentDom = document.documentElement.outerHTML;

    if (currentDom === prevDomState) return;

    //get diff
    const diff = dmp.diff_main(prevDomState, currentDom);
    console.log('diff here: ', diff);

    // If no real change, do nothing
    if (diff.length === 1 && diff[0][0] === 0) {
      return; // No significant changes
    }

    //cleanup diff
    if (diff.length > 2) {
      dmp.diff_cleanupSemantic(diff);
    }

    //get patches
    // Generate patches
    const patch_list = dmp.patch_make(prevDomState, currentDom);
    const patch_text = dmp.patch_toText(patch_list);
    // Avoid sending an empty patch
    if (!patch_text.trim()) {
      return;
    }

    if (patch_list.length > 0) {
      console.log('patches found: ', patch_list);
      const patchPayload = {
        type: "patch",
        data: patch_text
      }

      //send patch to server
      xhr.open('POST', "http://localhost:1212")
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(patchPayload));
    }


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
