'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Popover, PopoverButton, PopoverGroup, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { getDatabase, ref, set, onValue } from "firebase/database"
import { Avatar, Badge, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import { Link } from 'react-router-dom'


const firebaseConfig = {
  apiKey: "AIzaSyDgF9ieIhZlQltxXZXk7yvEdBbgkj3-2XI",
  authDomain: "ecom-674a8.firebaseapp.com",
  databaseURL: "https://ecom-674a8-default-rtdb.firebaseio.com",
  projectId: "ecom-674a8",
  storageBucket: "ecom-674a8.appspot.com",
  messagingSenderId: "975921817921",
  appId: "1:975921817921:web:6de76e7916338bb6b019c0",
  measurementId: "G-60HP08XS7L"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const database = getDatabase(app)

const navigation = {
  categories: [
    {
      id: 'veggies',
      name: 'Veggies',
      sections: [
        {
          items: [
            { name: 'Capsicum', href: '#' },
            { name: 'Onion', href: '#' },
            { name: 'Radish', href: '#' },
            { name: 'Beetroot', href: '#' },
            { name: 'Potato', href: '#' },
            { name: 'Beans', href: '#' },
            { name: 'Carrot', href: '#' },
            { name: 'Chillies', href: '#' },
            { name: 'Tomato', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'fruits',
      name: 'Fruits',
      sections: [
        {
          items: [
            { name: 'Apple', href: '#' },
            { name: 'Mango', href: '#' },
            { name: 'Papaya', href: '#' },
            { name: 'Kiwi', href: '#' },
            { name: 'Custard Apple', href: '#' },
            { name: 'Avacado', href: '#' },
            { name: 'Banana', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'milk',
      name: 'Milk',
      sections: [
        {
          items: [
            { name: 'Egg', href: '#' },
            { name: 'Paneer', href: '#' },
            { name: 'Curd', href: '#' },
            { name: 'Tofu', href: '#' },
            { name: 'Cow Milk', href: '#' },
            { name: 'Buffalo Milk', href: '#' },
            { name: 'Yogurt', href: '#' },
          ],
        },
      ],
    },
  ],
}

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (storedUser) {
      setUser(storedUser)
      fetchUserData(storedUser.uid)
      toast.success('Welcome back!', { id: 'welcome-back' })
    }
  }, [])

  useEffect(() => {
    if (user) {
      const cartRef = ref(database, `users/${user.uid}/cart`)
      onValue(cartRef, (snapshot) => {
        const cartData = snapshot.val() || {}
        const cartItems = Object.keys(cartData).map(key => ({
          id: key,
          ...cartData[key]
        }))
        setCart(cartItems)
        setCartItemCount(cartItems.length)
      })
    }
  }, [user])

  const fetchUserData = (userId) => {
    const userRef = ref(database, 'users/' + userId)
    onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      setCart(data.cart || [])
      setCartItemCount(data.cart ? Object.keys(data.cart).length : 0)
    })
  }

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const userRef = ref(database, 'users/' + user.uid)
      const userData = {
        name,
        email,
        phoneNo: '',
        address: '',
        cart: [],
        recentlyPurchased: []
      }

      await set(userRef, userData)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      toast.success('User created successfully')
      setShowSignup(false)
    } catch (error) {
      console.error("Error signing up:", error)
      toast.error('Error signing up')
    }
  }

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      fetchUserData(user.uid)
      toast.success('Logged in successfully')
      setShowLogin(false)
    } catch (error) {
      console.error("Error logging in:", error)
      toast.error('Error logging in')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userRef = ref(database, 'users/' + user.uid)
      onValue(userRef, async (snapshot) => {
        if (!snapshot.exists()) {
          const userData = {
            name: user.displayName,
            email: user.email,
            phoneNo: '',
            address: '',
            cart: [],
            recentlyPurchased: []
          }
          await set(userRef, userData)
        }
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        fetchUserData(user.uid)
        toast.success('Logged in with Google')
      }, {
        onlyOnce: true
      })
    } catch (error) {
      console.error("Error logging in with Google:", error)
      toast.error('Error logging in with Google')
    }
  }

  const handleLogout = () => {
    signOut(auth).then(() => {
      localStorage.removeItem('user')
      setUser(null)
      setCartItemCount(0)
      toast.success('Logged out successfully')
    }).catch((error) => {
      console.error("Error logging out:", error)
      toast.error('Error logging out')
    })
    setAnchorEl(null)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <div className="bg-white">
      <Toaster />
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel transition className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full">
            <div className="flex px-4 pb-2 pt-5">
              <button type="button" onClick={() => setOpen(false)} className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab key={category.name} className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pb-8 pt-10">
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p id={`${category.id}-${section.id}-heading-mobile`} className="font-medium text-gray-900">
                          {section.name}
                        </p>
                        <ul role="list" aria-labelledby={`${category.id}-${section.id}-heading-mobile`} className="mt-6 flex flex-col space-y-6">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a href={item.href} className="-m-2 block p-2 text-gray-500">
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>
            
            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {user ? (
                  <Fragment>
                    <Tooltip title={user.email}>
                      <IconButton onClick={handleMenuOpen}>
                        <Avatar alt={user.displayName} src={user.photoURL} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    <span className="ml-2 text-sm font-medium text-gray-700">{user.displayName}</span>
                  </Fragment>
                ) : (
                  <div className="space-y-6  border-gray-200 ">
                  <div className="flow-root">
                  <a onClick={() => setShowLogin(true)} className="-m-2 block p-2 font-medium text-gray-900 cursor-pointer">
                    Sign in
                  </a>
                </div>
                <div className="flow-root">
                  <a onClick={() => setShowSignup(true)} className="-m-2 block p-2 font-medium text-gray-900 cursor-pointer">
                    Create account
                  </a>
                </div>
                </div>
                )}
            </div>
            <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <img alt="" src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="block h-auto w-5 flex-shrink-0" />
                <span className="ml-3 block text-base font-medium text-gray-900">IND</span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button type="button" onClick={() => setOpen(true)} className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>
              {/* Logo */}
              {/* <div className="ml-4 flex lg:ml-0">
                <a href="#">
                  <span className="sr-only">Your Company</span>
                  <img alt="" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto" />
                </a>
              </div> */}
              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-[open]:border-indigo-600 data-[open]:text-indigo-600">
                          {category.name}
                        </PopoverButton>
                      </div>
                      <PopoverPanel transition className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in">
                      
                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />
                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.sections.map((section) => (
                                  <div key={section.name}>
                                    <p id={`${section.name}-heading`} className="font-medium text-gray-900">
                                      {section.name}
                                    </p>
                                    <ul role="list" aria-labelledby={`${section.name}-heading`} className="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <a href={item.href} className="hover:text-gray-800">
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}
              
                </div>
              </PopoverGroup>
              <div className="ml-auto flex items-center">
                {user ? (
                  <Fragment>
                    <Tooltip title={user.email}>
                      <IconButton onClick={handleMenuOpen}>
                        <Avatar alt={user.displayName} src={user.photoURL} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    <span className="ml-2 text-sm font-medium text-gray-700">{user.displayName}</span>
                  </Fragment>
                ) : (
                  <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                    <a onClick={() => setShowLogin(true)} className="text-sm font-medium text-gray-700 hover:text-gray-800 cursor-pointer">
                      Sign in
                    </a>
                    <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                    <a onClick={() => setShowSignup(true)} className="text-sm font-medium text-gray-700 hover:text-gray-800 cursor-pointer">
                      Create account
                    </a>
                  </div>
                )}
                <div className="hidden lg:ml-8 lg:flex">
                  <a href="#" className="flex items-center text-gray-700 hover:text-gray-800">
                    <img alt="" src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="block h-auto w-5 flex-shrink-0" />
                    <span className="ml-3 block text-sm font-medium">IND</span>
                    <span className="sr-only">, change currency</span>
                  </a>
                </div>
                {/* Search */}
                <div className="flex lg:ml-6">
                  <a href="#" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
                  </a>
                </div>
                {/* Cart */}
                <Link to={'/cart'}>
                <div className="ml-4 flow-root lg:ml-6">
                  <Badge badgeContent={cartItemCount} color="primary">
                    <a href="#" className="group -m-2 flex items-center p-2">
                      <ShoppingBagIcon aria-hidden="true" className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                      <span className="sr-only">items in cart, view bag</span>
                    </a>
                  </Badge>
                </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
      {/* Login and Signup Popups */}
      {showLogin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2 p-2 border rounded w-full" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-2 p-2 border rounded w-full" />
            <button onClick={handleLogin} className="bg-indigo-600 text-white p-2 rounded w-full">Login</button>
            <button onClick={handleGoogleLogin} className="bg-red-600 text-white p-2 rounded w-full mt-2">Login with Google</button>
            <button onClick={() => setShowLogin(false)} className="text-gray-500 mt-4 block">Close</button>
          </div>
        </motion.div>
      )}
      {showSignup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-2 p-2 border rounded w-full" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2 p-2 border rounded w-full" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-2 p-2 border rounded w-full" />
            <button onClick={handleSignup} className="bg-indigo-600 text-white p-2 rounded w-full">Sign Up</button>
            <button onClick={handleGoogleLogin} className="bg-red-600 text-white p-2 rounded w-full mt-2">SignUp with Google</button>
            <button onClick={() => setShowSignup(false)} className="text-gray-500 mt-4 block">Close</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
