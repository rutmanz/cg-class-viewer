import { cleanClassName } from "../../../../veracrossscraper/lib/util";
import { parseDirectoryEntry } from "../../../../veracrossscraper/lib/parser";

export async function getVeracrossCookie() {
    try {
        const cookie = await chrome.cookies.get({ name: "_veracross_session", url: "https://portals.veracross.com/", });
        return cookie!.value
    } catch (error) {
        return `Unexpected error: ${error.message}`;
    }
}

async function getVeracrossPage(path: string): Promise<string | undefined> {
    const resp = await fetch(path, {
        headers: {
            "cookie": "_veracross_session=" + getVeracrossCookie()
        },
        redirect: "manual",
        window:null
    })
    if (!resp.ok) {
        return undefined
    }

    const text = (await resp.text()).replace(/<script>?[\S\s]+?<\/script>/mg, "")
    return text
}
export async function isValidLogin(school:string) {
    const html = await getVeracrossPage(`https://portals.veracross.com/${school}/student/student/overview`)
    return html != null
}
export async function getData(school:string) {
    const html = await getVeracrossPage(`https://portals.veracross.com/${school}/student/student/overview`)
    if (html == null) {
        return null;
    }
    console.log("loading overview")
    const dom = $(html)

    const lists = dom.find(".vx-list.course-list")
    const classes: { name: string, id: string }[] = []
    lists.each((_, list) => {
        $(list).find("a.course-description").each((i, element) => {
            const url: string = element["href"]
            classes.push({ id: url.match(/\/course\/(\d{1,4})\/website/)![1], name: cleanClassName(element.textContent!.trim()) })
        })
    })




    const entries: { [key: string]: string[] } = {}
    await Promise.all(classes.map(async ({ name, id }) => {
        const html = await getVeracrossPage(`https://classes.veracross.com/${school}/course/${id}/website/directory`)
        let dom;
        try {
            dom = $(html!)
        } catch (e) {
            console.warn(e)
        }
        console.log("Loading", name)

        dom.find(".directory-Entry").each((i, element) => {
            const entry = parseDirectoryEntry($, element)
            entries[entry.name] ??= []
            entries[entry.name].push(name)
        })
    }))
    console.log(entries)
    return entries
}
