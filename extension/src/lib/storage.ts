const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve(result)
        )
    )

function setStorageData(data): Promise<void> {
    return new Promise((resolve, reject) =>
        chrome.storage.sync.set(data, () =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve()
        )
    );
}

export async function getSchool():Promise<string | undefined> {
    return (await getStorageData("schoolname") as any)["schoolname"]
}
export async function setSchool(value:string) {
    await setStorageData({"schoolname": value})
}