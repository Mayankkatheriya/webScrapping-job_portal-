// Importing required libraries
const axios = require("axios");
const cheerio = require("cheerio");
const xlsx = require("xlsx");

// Array to store product data
const jobData = [];

// Function to fetch job data from TimesJobs website
const fetchData = async () => {
  try {
    // Sending a GET request to the TimesJobs website
    const response = await axios.get(
      "https://www.timesjobs.com/candidate/job-search.html?searchType=Home_Search&from=submit&asKey=OFF&txtKeywords=&cboPresFuncArea=35",
      {
        headers: {
          "content-type": "text/html",
        },
      }
    );

    // Using Cheerio to load and parse HTML response
    const $ = cheerio.load(response.data);
    
    // Extracting job information from the HTML
    const jobContainer = $(".clearfix.job-bx.wht-shd-bx");
    $(jobContainer).each((i, job) => {
      // Extracting specific details for each job
      let companyName = $(job).find("h3.joblist-comp-name").text().split('(')[0].split('\n')[1].trim();
      let salary = $(job).find('ul.top-jd-dtl.clearfix > li:nth-child(2)').text().trim();
      let location = $(job).find('ul.top-jd-dtl.clearfix > li:nth-child(3) > span').text().trim();
      let posted = $(job).find('span.sim-posted').text().split('Posted')[1].split('\n')[0].trim();
      let description = $(job).find('ul.list-job-dtl.clearfix > li:first-child').text().split(':')[1].split('...')[0].split('\n')[1].trim();
      
      // Checking for missing data and skipping if any field is empty
      if (!companyName || !salary || !location || !posted || !description) {
        return;
      }

      // Storing job details in the jobData array
      jobData.push({
        "Company Name": companyName,
        Location: location,
        Description: `${description}...`,
        Salary: salary,
        "Posted on": `Posted ${posted}`
      });
    });

    // Creating an Excel workbook and worksheet from the jobData array
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(jobData);
    
    // Appending the worksheet to the workbook and writing it to an Excel file
    xlsx.utils.book_append_sheet(workbook, worksheet, "output.xlsx");
    xlsx.writeFile(workbook, "output.xlsx");

  } catch (err) {
    // Handling errors and logging error messages
    console.error(`Error scraping : ${err}`);
  }
};

// Calling the fetchData function to initiate the process
fetchData();
