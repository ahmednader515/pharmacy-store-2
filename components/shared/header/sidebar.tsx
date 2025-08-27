import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu, UserCircle, X, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { SignOut } from "@/lib/actions/user.actions";
import { auth } from "@/auth";

// Arabic translations for categories
const categoryTranslations: { [key: string]: string } = {
  'Pain Relief': 'تسكين الآلام',
  'Vitamins & Supplements': 'فيتامينات ومكملات غذائية',
  'Allergy & Sinus': 'الحساسية والجيوب الأنفية',
  'Digestive Health': 'صحة الجهاز الهضمي',
  'Cold & Flu': 'نزلات البرد والإنفلونزا',
  'Prescription Medications': 'الأدوية الموصوفة',
  'Over-the-Counter': 'الأدوية المتاحة بدون وصفة',
  'Personal Care': 'العناية الشخصية',
  'Health & Wellness': 'الصحة والعافية',
  'First Aid': 'الإسعافات الأولية',
  'Baby Care': 'العناية بالطفل',
  'Elderly Care': 'العناية بالمسنين',
  'Diabetes Care': 'العناية بمرضى السكري',
  'Heart Health': 'صحة القلب',
  'Mental Health': 'الصحة النفسية',
  'Women\'s Health': 'صحة المرأة',
  'Men\'s Health': 'صحة الرجل',
  'Skin Care': 'العناية بالبشرة',
  'Hair Care': 'العناية بالشعر',
  'Oral Care': 'العناية بالفم والأسنان'
};

export default async function Sidebar({ categories }: { categories: string[] }) {
  const session = await auth()

  const handleSignOut = async () => {
    try {
      await SignOut()
      // Refresh the page after successful sign-out
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, refresh the page to clear any cached state
      window.location.reload()
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-[350px] mt-0 top-0">
        <div className="flex flex-col h-full">
          {/* User Sign In Section */}
          <div className="bg-gray-800 text-foreground flex items-center justify-between  ">
            <DrawerHeader>
              <DrawerTitle className="flex items-center">
                <UserCircle className="h-6 w-6 mr-2" />
                {session ? (
                  <DrawerClose asChild>
                    <Link href="/account">
                      <span className="text-lg font-semibold">
                        Hello, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href="/sign-in" className="sidebar-link">
                      <span className="text-lg font-semibold">
                        Hello, sign in
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Shop By Category */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Shop By Department
              </h2>
            </div>
            <nav className="flex flex-col">
              {/* Home Page Link */}
              <DrawerClose asChild>
                <Link
                  href="/"
                  className="flex items-center justify-between item-button sidebar-link"
                >
                  <span className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    الصفحة الرئيسية
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </DrawerClose>
              
              {/* Category Links */}
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${category}`}
                    className={`flex items-center justify-between item-button sidebar-link`}
                  >
                    <span>{categoryTranslations[category] || category}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* Setting and Help */}
          <div className="border-t flex flex-col ">
            <div className="p-4">
              <h2 className="text-lg font-semibold">
                Help & Settings
              </h2>
            </div>
            <DrawerClose asChild>
              <Link href="/account" className="item-button sidebar-link">
                Your account
              </Link>
            </DrawerClose>{" "}
            <DrawerClose asChild>
              <Link
                href="/page/customer-service"
                className="item-button sidebar-link"
              >
                Customer Service
              </Link>
            </DrawerClose>
            {session ? (
              <Button
                className="w-full justify-start item-button text-base"
                variant="ghost"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            ) : (
              <Link href='/sign-in' className='item-button sidebar-link'>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
