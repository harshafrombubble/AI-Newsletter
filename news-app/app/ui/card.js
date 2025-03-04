'use client'
import {useState, useEffect} from 'react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Card, CardActions, CardContent} from '@mui/material';
import {FormGroup, FormControlLabel, FormControl, FormHelperText} from '@mui/material';
import {Button, TextField, Switch, Stack, Select, MenuItem, Checkbox} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import {
  createTheme,
  ThemeProvider,
  alpha,
  getContrastRatio,
} from '@mui/material/styles';

const theme = createTheme({
  palette: {
    inc: {
      main: '#B2A5FF',
      contrastText: '#fff',
    },
    exc: {
      main: '#C4D9FF',
      contrastText: '#fff',
    },
    minc: {
      main: '#C5BAFF',
      contrastText: '#fff',
    },
  },
});

async function newsPOST(req) {
  try {const response = await fetch('/api/news', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    })
    return await response.json()
  } catch (error) {console.error('Error fetching data:', error);}
}

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
  try {const response = await fetch('/api/database/preferences?', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  return await response.json()
  } catch (error) {console.error('Error with DynamoDB PUT:', error);}
}

export default function OutlinedCard({session, updateData}) {
  const [keyOp, setKeyOp] = useState('+');
  const [keyInput, setKeyInput] = useState('');
  const [categories, setCategories] = useState({
    general: false,
    science: false,
    sports: false,
    business: false,
    health: false,
    entertainment: false,
    tech: false,
    politics: false,
    food: false,
    travel: false
  });
  const { general, science, sports, business, health, entertainment, tech, politics, food, travel } = categories;
  const [domainOp, setDomainOp] = useState('+');
  const [domainInput, setDomainInput] = useState('');
  const [andKeys, setAndKeys] = useState([]);
  const [orKeys, setOrKeys] = useState([]);
  const [notKeys, setNotKeys] = useState([]);
  const [domains, setDomains] = useState([]);
  const [emailToggle, setEmailToggle] = useState(false);
  const [textToggle, setTextToggle] = useState(false);

  // Handle Toggles
  const handleEmailToggleChange = () => {
    setEmailToggle(prevState => !prevState);
  };
  const handleTextToggleChange = () => {
    setTextToggle(prevState => !prevState);
  };

  // Handle Keywords Op
  const handleKeyOp = (e) => {
    setKeyOp(e.target.value);
  };

  // Handle Keywords
  const handleKeyInputChange = (e) => {
    setKeyInput(e.target.value);
  };
  const handleAddKeyword = (e) => {
    var input = keyInput.trim()
    if (e.key === 'Enter' && input !== '') {
      if (keyOp == "+") {
        setAndKeys((prev) => prev.includes(input) ? prev : [...prev, input]);
        setKeyInput('');
      }
      else if (keyOp == "-") {
        setNotKeys((prev) => prev.includes(input) ? prev : [...prev, input]);
        setKeyInput('');
      }
      else if (keyOp == "|") {
        setOrKeys((prev) => prev.includes(input) ? prev : [...prev, input]);
        setKeyInput('');
      }
    }
  };
  const handleRemoveKeyword = (type, keyword) => {
    if (type == '+') { setAndKeys((prev) => prev.filter((item) => item !== keyword)); }
    if (type == '|') { setOrKeys((prev) => prev.filter((item) => item !== keyword)); }
    if (type == '-') { setNotKeys((prev) => prev.filter((item) => item !== keyword)); }
  };

  // Handle Categories
  const handleCategories = (e) => {
    setCategories({
      ...categories,
      [e.target.name]: e.target.checked,
    });
  };

  // Handle Domain Op
  const handleDomainOp = (e) => {
    setDomainOp(e.target.value);
  };

  // Handle Domains
  const handleDomainInputChange = (e) => {
    setDomainInput(e.target.value);
  };
  const handleAddDomain = (e) => {
    var input = domainOp + domainInput.trim()
    if (e.key === 'Enter' && input !== '') {
      setDomains((prev) => prev.includes(input) ? prev : [...prev, input]);
      setDomainInput('');
    }
  };
  const handleRemoveDomain = (domain) => {
    setDomains((prev) => prev.filter((item) => item !== domain)
    );
  };

  // Handle Form Submission
  const handleFilter = async (event) => {
    // Prevent default form submission
    if (event) {event.preventDefault();}
    const res = await newsPOST({
      and: andKeys,
      or: orKeys,
      not: notKeys,
      categories: categories,
      domains: domains,
    })
    updateData(res)
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const filterQuery = {
      id: session.user.id,
      email: null,
      phoneNumber: null,
      and: andKeys,
      or: orKeys,
      not: notKeys,
      categories: categories,
      domains: domains,
      notifText: textToggle,
      notifEmail: emailToggle
    }

    const res = databasePUT(filterQuery)
    console.log("Saved User Profile and Preferences")
  }

  const autoFill = async(event) => {
    const query = {
      table: "UserPreferences",
      id: session.user.id
    }
    const res = await databaseGET(query)
    console.log("Autofilled User Preferences")
    
    setDomains(res.Domains)
    setCategories(res.Categories)
    setAndKeys(res.Keys.And)
    setOrKeys(res.Keys.Or)
    setNotKeys(res.Keys.Not)
    setEmailToggle(res.Notifications.Email)
    setTextToggle(res.Notifications.Text)
  }
  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      autoFill();
      ignore = true;
    }
    },[]);

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ minWidth: 275, backgroundColor: '#6573C3'}}>
      <Card variant="outlined"><React.Fragment><FormGroup>
      
      <CardContent>

      <Typography gutterBottom variant="h6" component="div">FILTERS</Typography>

      {/* Keywords Section */}
      <Box>
        <Typography gutterBottom variant="h6" component="div">Keywords</Typography>

        <Stack direction="row" spacing={2}>
        <Box sx={{ width: 100, maxWidth: '20%' }}>
        <FormControl>
        <InputLabel>Filter</InputLabel>
        <Select
          value={keyOp}
          label="filter *"
          onChange={handleKeyOp}
        >
          <MenuItem value={"+"}>include</MenuItem>
          <MenuItem value={"-"}>exclude</MenuItem>
          <MenuItem value={"|"}>may inc.</MenuItem>
        </Select>
        <FormHelperText>Required</FormHelperText>
        </FormControl>
        </Box>

        <Box sx={{ width: 200, maxWidth: '60%' }}>
          <TextField 
          label="search keywords"
          type="text"
          value={keyInput}
          onChange={handleKeyInputChange}
          onKeyDown={handleAddKeyword}
          placeholder="Enter Keywords Here"/>
        </Box>
        </Stack>

        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', maxWidth: '56%'}}>
          {andKeys.map((keyword, index) => (
            <Button 
            variant="contained"
            key={index}
            color="inc"
            onClick={() => handleRemoveKeyword('+', keyword)}
            >{'✓ '+keyword}
            </Button>
          ))}
          {orKeys.map((keyword, index) => (
            <Button 
            variant="contained"
            key={index}
            color="minc"
            onClick={() => handleRemoveKeyword('|', keyword)}
            >{'○ '+keyword}
            </Button>
          ))}
          {notKeys.map((keyword, index) => (
            <Button 
            variant="contained"
            key={index}
            color="exc"
            onClick={() => handleRemoveKeyword('-', keyword)}
            >{'⨉ '+keyword}
            </Button>
          ))}
        </Stack>

      </Box>

      {/* Categories Section */}
      <Box>
        <Typography gutterBottom variant="h6" component="div">Categories</Typography>

        <Box sx={{ width: 500, maxWidth: '100%', maxHeight: 100, overflow: 'auto'}}>
          <FormGroup>
          {['general', 'science', 'sports', 'business', 'health', 'entertainment', 'tech', 'politics', 'food', 'travel'].map((label, index) => (
          <FormControlLabel
          key={index}
          control={<Checkbox checked={categories[label]} onChange={handleCategories} name={label} />}
          label={label}/>
          ))}
          </FormGroup>
        </Box>

      </Box>
      
      {/* Domains Section */}
      <Box>
        <Typography gutterBottom variant="h6" component="div">Domains</Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ width: 100, maxWidth: '20%' }}>
          <FormControl>
          <InputLabel>Filter</InputLabel>
          <Select
            value={domainOp}
            label="filter *"
            onChange={handleDomainOp}>
            <MenuItem value={"+"}>include</MenuItem>
            <MenuItem value={"-"}>exclude</MenuItem>
          </Select>
          <FormHelperText>Required</FormHelperText>
          </FormControl>
          </Box>
          
          <Box sx={{ width: 500, maxWidth: '100%' }}>
            <TextField 
            label="search domains"
            type="text"
            value={domainInput}
            onChange={handleDomainInputChange}
            onKeyDown={handleAddDomain}
            placeholder="Enter Domains Here"/>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', maxWidth: '56%'}}>
          {domains.map((domain, index) => (
            <Button 
            variant="contained"
            key={index}
            onClick={() => handleRemoveDomain(domain)}
            >{domain}
            </Button>
          ))}
        </Stack>

      </Box>
      
      {/* Subscription Section */}
      <Box>
        <Typography gutterBottom variant="h6" component="div">Subscription</Typography>
          <FormControlLabel
          control={<Switch/>}
          label="Email"
          onChange={handleEmailToggleChange}
          />
          <FormControlLabel
          control={<Switch/>}
          label="Text"
          onChange={handleTextToggleChange}
          />
      </Box>
      
      </CardContent>
      
      {/* Submission Section */}
      <CardActions>
        <Button size="small" onClick={handleFilter} >Apply Filter</Button>
        <Button size="small" onClick={handleSave}>Save</Button>
      </CardActions>
      
      </FormGroup></React.Fragment></Card>
    </Box>
    </ThemeProvider>
  );
}