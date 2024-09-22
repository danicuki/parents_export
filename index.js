const fs = require("fs")
const axios = require("axios")
const csvWriter = require("csv-writer").createObjectCsvWriter
require("dotenv").config()

const SCHOOL_ID = process.env.SCHOOL_ID
const CSV_FILE = "parents_info.csv"

// Load the parents.json file
const parentsListUrl = `https://api.classlist.com/_ah/api/school/v1/get/${SCHOOL_ID}/parents`

// Define the URL and headers template for the API call
// const urlTemplate = "https://api.classlist.com/_ah/api/parent/v1/895041445/get/{parentId}/parent"
const urlTemplate = `https://api.classlist.com/_ah/api/school/v1/get/${SCHOOL_ID}/parent/{parentId}`
const headers = {
  accept: "application/json, text/plain, */*",
  classlisttoken:
  process.env.CLASSLIST_TOKEN,
  cookie: process.env.COOKIE,
}

// Set up CSV writer
const writer = csvWriter({
  path: CSV_FILE,
  header: [
    { id: "id", title: "Id" },
    { id: "Name", title: "Name" },
    { id: "Email", title: "Email" },
    { id: "Avatar", title: "Avatar" },
    { id: "PhoneNumber", title: "PhoneNumber" },
    { id: "Relation", title: "Relation" },
    { id: "PupilName1", title: "PupilName1" },
    { id: "PupilTier1", title: "PupilTier1" },
    { id: "PupilName2", title: "PupilName2" },
    { id: "PupilTier2", title: "PupilTier2" },
    { id: "PupilName3", title: "PupilName3" },
    { id: "PupilTier3", title: "PupilTier3" },
    { id: "PupilName4", title: "PupilName4" },
    { id: "PupilTier4", title: "PupilTier4" },
    { id: "FamilyName1", title: "FamilyName1" },
    { id: "FamilyEmail1", title: "FamilyEmail1" },
    { id: "FamilyPhone1", title: "FamilyPhone1" },
    { id: "FamilyName2", title: "FamilyName2" },
    { id: "FamilyEmail2", title: "FamilyEmail2" },
    { id: "FamilyPhone2", title: "FamilyPhone2" },
  ],
})

// Function to get parent data
const fetchParentData = async (parent) => {
  let parentId = parent.id
  try {
    const url = urlTemplate.replace("{parentId}", parentId)
    console.log("fetching ", url)
    const response = await axios.get(url, { headers })

    if (response.status === 200) {
      const parentInfo = response.data
      const pupils = parentInfo.pupils || []
      const family = parentInfo.familyMembers || []

      return {
        id: parentId,
        Name: parentInfo.name || "",
        Email: parentInfo.mail || "",
        PhoneNumber: parentInfo.phone || "",
        Relation: pupils[0]?.relation || "",
        PupilName1: pupils[0]?.name || "",
        PupilTier1: pupils[0]?.tier || "",
        PupilName2: pupils[1]?.name || "",
        PupilTier2: pupils[1]?.tier || "",
        PupilName3: pupils[2]?.name || "",
        PupilTier3: pupils[2]?.tier || "",
        PupilName4: pupils[3]?.name || "",
        PupilTier4: pupils[3]?.tier || "",
        FamilyName1: family[0]?.fullName || "",
        FamilyEmail1: family[0]?.mail || "",
        FamilyPhone1: family[0]?.phone || "",
        FamilyName2: family[1]?.fullName || "",
        FamilyEmail2: family[1]?.mail || "",
        FamilyPhone2: family[1]?.phone || "",
        Avatar: parentInfo.avatar || "",
        joinedAt: parentInfo.joinedAt || "",
      }
    }
  } catch (error) {
    console.error(`Error fetching data for parent ID ${parentId}:`, error.message)
  }
  return null
}

// Fetch data for all parents and write to CSV
const processParentsData = async () => {
  console.log("Fetching list of all parents...")
  const response = await axios.get(parentsListUrl, { headers })
  if (response.status === 200) {
    const parents = response.data.items // Assuming the list of parents is in `response.data.parents`

    const fetchPromises = parents.map(fetchParentData)
    const results = await Promise.all(fetchPromises)
    const validResults = results.filter((data) => data !== null)

    await writer.writeRecords(validResults)
    console.log("CSV file created successfully:", CSV_FILE)
  } else {
    console.error("Error fetching list of parents")
  }
}

processParentsData()
