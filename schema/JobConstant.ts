

interface JobPostedType {
    id : string,
    title : string,
    company : string,
    salary : string // change this later to nunber
    location : string // this will be  json object later that will be on supabase
    type : string // add enum type in here to consistent
    posted : string // this is timeStamp from the supabse

} 

const JOBS_POSTED = [
  {
    id: '1',
    title: 'Emergency Pipe Repair',
    company: 'Manila Residences',
    salary: '₱1,500',
    location: 'Makati City',
    type: 'Urgent',
    posted: '2h ago',
  }
];

