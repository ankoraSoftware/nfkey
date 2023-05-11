'use client';
import { useRouter } from 'next/router';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  Squares2X2Icon,
  LockClosedIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../assets/nfkey.png';
import { getProvider } from '@/components/Web3modal';
import axios from 'axios';
import Router from 'next/router';
import toast from 'react-hot-toast';
import { Helper } from '@/helpers/helper';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Nfts', href: '/nft', icon: Squares2X2Icon },
  { name: 'Locks', href: '/lock', icon: LockClosedIcon },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ user }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const currentRoute = router.pathname;

  const handleClick = async () => {
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const { data } = await axios.get('/api/auth/nonce');
      const signature = await signer.signMessage(data.message);
      await axios.post('/api/auth/signin', {
        signature,
        message: data.message,
      });
      toast.success('Successfully logged!');
      Router.reload();
    } catch (e) {
      const er = JSON.parse(JSON.stringify(e));
      toast.error(er.reason);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.delete('/api/auth/logout');
      Router.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="lg:w-[300px] w-full relative">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                    <div className="flex h-16 shrink-0 items-center">
                      <Image
                        width={100}
                        height={100}
                        className="h-20 w-auto"
                        src={Logo}
                        alt="Your Company"
                      />
                      <h3 className="text-orange-500 font-bold ml-2">NFKEY</h3>
                    </div>
                    <nav className="flex flex-col h-max-[100px]">
                      <ul role="list" className="flex flex-col gap-y-7">
                        <ul role="list" className="-mx-2 space-y-1">
                          {!user ? (
                            <button
                              className="bg-orange-500 rounded-lg p-2 hover:bg-orange-400 text-white text-sm"
                              onClick={handleClick}
                            >
                              Connect wallet
                            </button>
                          ) : (
                            <div
                              className="flex items-center justify-start rounded-lg cursor-pointer p-2 hover:bg-gray-100"
                              onClick={() => router.push('/')}
                            >
                              <UserCircleIcon className="w-7 h-7 text-orange-500" />
                              <p className="text-black ml-1 text-center text-sm font-semibold">
                                {`${user?.wallet?.substring(0, 2)}...
                              ${user?.wallet?.substring(
                                user?.wallet?.length - 4,
                                user?.wallet?.length
                              )}`}
                              </p>
                            </div>
                          )}
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  currentRoute === item.href
                                    ? 'bg-gray-50 text-orange-500'
                                    : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    currentRoute === item.href
                                      ? 'text-orange-500'
                                      : 'text-gray-400 group-hover:text-orange-500',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </ul>
                      <div
                        className="flex items-center hover:text-orange-500 cursor-pointer w-max absolute bottom-5"
                        onClick={handleLogout}
                      >
                        <ArrowLeftOnRectangleIcon className="w-8 h-8 m-2" />
                        <span>Logout</span>
                      </div>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div
              className="flex h-16 shrink-0 items-center cursor-pointer group"
              onClick={() => router.push('/')}
            >
              <Image
                width={100}
                height={100}
                className="h-20 w-auto"
                src={Logo}
                alt="Your Company"
              />
              <h3 className="text-orange-500 font-bold ml-2 text-2xl group-hover:text-orange-300">
                NFKEY
              </h3>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            currentRoute === item.href
                              ? 'bg-gray-50 text-orange-500'
                              : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              currentRoute === item.href
                                ? 'text-orange-500'
                                : 'text-gray-400 group-hover:text-orange-500',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
              {!user ? (
                <button
                  className="bg-orange-500 rounded-lg p-2 min-w-[100px] min-h-[50px] hover:bg-orange-400 text-white mb-5"
                  onClick={handleClick}
                >
                  Connect wallet
                </button>
              ) : (
                <div className="mb-5 ">
                  <div
                    className="flex items-center border-b border-gray-300 justify-start p-2"
                    onClick={() => router.push('/')}
                  >
                    <UserCircleIcon className="w-10 h-10 text-orange-500" />
                    <p className="text-black ml-2 text-center font-semibold">
                      {Helper.walletTruncate(user?.wallet)}
                    </p>
                  </div>
                  <div
                    className="flex items-center hover:text-orange-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <ArrowLeftOnRectangleIcon className="w-8 h-6 m-2" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            <div className="flex items-center">
              <Image
                width={100}
                height={100}
                className="h-11 w-auto"
                src={Logo}
                alt="Your Company"
              />
              <h3 className="text-orange-500 font-bold ml-2">NFKEY</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
