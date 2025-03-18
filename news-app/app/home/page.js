'use client'
import NewsTable from '../ui/table.js'
import OutlinedCard from '../ui/card.js'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import {useState} from 'react';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { useSession, signIn, signOut } from "next-auth/react"

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
};

async function databaseGET(req) {
  try {
    const queryParams = new URLSearchParams(req).toString();
    const url = `/api/database?${queryParams}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
    })
    return await response.json()
  } catch (error) {
    console.log("Error in DynamoDB GET")
  }
}

async function databasePUT(req) {
  try {const response = await fetch('/api/database?', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  return await response.json()
  } catch (error) {console.error('Error with DynamoDB PUT:', error);}
}

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [email, setEmail] = useState(1);
  const [phone, setPhone] = useState(1);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return(
      <>
      Not signed in <br/>
      <button onClick={() => signIn()}>Sign in</button>
      </>
    )
  }
  
  const handleEmailInputChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handlePhoneInputChange = (e) => {
    setPhoneInput(e.target.value);
  };

  const handleOpen = async () => {
    if (email == 1 && phone == 1) {
      const query = {
        table: "Users",
        id: session.user.id
      }
      const res = await databaseGET(query)
      setEmail(res.Email)
      setEmailInput(res.Email)
      setPhone(res.PhoneNumber)
      setPhoneInput(res.PhoneNumber)
    }
    setEmailInput(email)
    setPhoneInput(phone)
    setOpen(true);
  };

  const handleClose = async () => setOpen(false);

  const handleSave = async () => {
    
    // validate the submission

    if ((email != emailInput) || (phone != phoneInput)) {
      const query = {
        id: session.user.id,
        email: emailInput ? emailInput : null,
        phoneNumber: phoneInput ? phoneInput : null,
      }
  
      const res = databasePUT(query)
      setEmail(emailInput ? emailInput : null)
      setPhone(phoneInput ? phoneInput : null)
    }
  }

  const updateData = (newData) => {
    let parsedData = []
    for (let i = 0; i < newData.data.length; i++) {
      parsedData[i] = {
        date: new Date(newData.data[i].published_at).toLocaleDateString(),
        title: newData.data[i].title,
        url: newData.data[i].url,
        domain: newData.data[i].source,
        keywords: newData.data[i].keywords.slice(0, 5),
        categories: newData.data[i].categories.join(', ')
      }
    }
    setData(parsedData);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={9}>
        <NewsTable data = {data}/>
        </Grid>
        <Grid size={3}>
        <OutlinedCard session = {session} updateData = {updateData}/>
        </Grid>
      </Grid>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => handleOpen()}>Account Settings</button>
      
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={style}>
          <TextField
            label="Email"
            onChange={handleEmailInputChange}
            defaultValue={emailInput}
          />
          <TextField
            label="Phone Number - Only #s"
            onChange={handlePhoneInputChange}
            defaultValue={phoneInput}
          />
          <button onClick={() => handleSave()}>Save</button>
        </Box>
      </Modal>

    </Box>
  );
}
