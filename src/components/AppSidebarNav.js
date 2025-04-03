// import React from 'react';
// import PropTypes from 'prop-types';
// import { NavLink } from 'react-router-dom';
// import SimpleBar from 'simplebar-react';
// import 'simplebar-react/dist/simplebar.min.css';
// import { useSelector } from 'react-redux';
// import { CBadge, CNavLink, CSidebarNav } from '@coreui/react';

// export const AppSidebarNav = ({ items }) => {
//   // Utility function to create the navigation link structure
//   const navLink = (name, icon, badge, indent = false) => (
//     <>
//       {icon
//         ? icon
//         : indent && (
//             <span className="nav-icon">
//               <span className="nav-icon-bullet"></span>
//             </span>
//           )}
//       {name}
//       {badge && (
//         <CBadge color={badge.color} className="ms-auto">
//           {badge.text}
//         </CBadge>
//       )}
//     </>
//   );

//   // Function to create individual navigation items
//   const navItem = (item, index, indent = false) => {
//     const { component: Component, name, badge, icon, ...rest } = item;
//     return (
//       <Component as="div" key={index}>
//         {rest.to || rest.href ? (
//           <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
//             {navLink(name, icon, badge, indent)}
//           </CNavLink>
//         ) : (
//           navLink(name, icon, badge, indent)
//         )}
//       </Component>
//     );
//   };

//   // Function to create navigation groups
//   const navGroup = (item, index) => {
//     const { component: Component, name, icon, items: subItems, ...rest } = item;
//     return (
//       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
//         {subItems?.map((subItem, subIndex) =>
//           subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true),
//         )}
//       </Component>
//     );
//   };

//   // Selectors to determine which section to show
//   const { home, master, reports, expense, support } = useSelector((state) => state.navbar);

//   // Filter items based on active section dashboard
//   const filterItemsForSection = (section) => {
//     console.log('Filtering for master dashboard:', section);
//     if (section === 'home') {
//       return items.filter((item) => item.name === 'Dashboard');
//     }
//     return items;
//   };

//   // Filter items based on active section master
//   const filterItemsForSection1 = (section) => {
//     console.log('Filtering for master section:', section);
//     if (section === 'master') {
//       const filteredItems = items.filter((item) => item.name === 'Master');
//       console.log('Filtered items for master:', filteredItems);
//       return filteredItems;
//     }
//     return items;
//   };

//   // Filter items based on active section Reports
//   const filterItemsForSection2 = (section) => {
//     console.log('Filtering for reports section:', section);
//     if (section === 'reports') {
//       return items.filter((item) => item.name === 'Report');
//     }
//     return items;
//   };

//   // Filter items based on active section Expense Management
//   const filterItemsForSection3 = (section) => {
//     console.log('Filtering for Expense management section:', section);
//     if (section === 'expense') {
//       return items.filter((item) => item.name === 'Expense Management');
//     }
//     return items;
//   };

//   // Render the sidebar navigation
//   return (
//     <>
//       {home && (
//         <CSidebarNav as={SimpleBar}>
//           {filterItemsForSection('home').map((item, index) =>
//             item.items ? navGroup(item, index) : navItem(item, index),
//           )}
//         </CSidebarNav>
//       )}

//       {master && (
//         <CSidebarNav as={SimpleBar}>
//           {filterItemsForSection1('master').map((item, index) =>
//             item.items ? navGroup(item, index) : navItem(item, index),
//           )}
//         </CSidebarNav>
//       )}

//       {reports && (
//         <CSidebarNav as={SimpleBar}>
//           {filterItemsForSection2('reports').map((item, index) =>
//             item.items ? navGroup(item, index) : navItem(item, index),
//           )}
//         </CSidebarNav>
//       )}

//       {expense && (
//         <CSidebarNav as={SimpleBar}>
//           {filterItemsForSection3('expense').map((item, index) =>
//             item.items ? navGroup(item, index) : navItem(item, index),
//           )}
//         </CSidebarNav>
//       )}

//       {support && (
//         <CSidebarNav as={SimpleBar}>
//           {filterItemsForSection('support').map((item, index) =>
//             item.items ? navGroup(item, index) : navItem(item, index),
//           )}
//         </CSidebarNav>
//       )}
//     </>
//   );
// };

// AppSidebarNav.propTypes = {
//   items: PropTypes.arrayOf(PropTypes.any).isRequired,
// };

// ############################# New Change on navigation sidebar ################################################# //
// This is logic for show component sperate logic portion.

import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { useSelector } from 'react-redux'
import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {
  // Utility function to create the navigation link structure
  const navLink = (name, icon, badge, indent = false) => (
    <>
      {icon
        ? icon
        : indent && (
          <span className="nav-icon">
            <span className="nav-icon-bullet"></span>
          </span>
        )}
      {name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  )

  // Function to create individual navigation items
  const navItem = (item, index, indent = false) => {
    const { component: Component, name, badge, icon, ...rest } = item
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  // Function to create navigation groups
  const navGroup = (item, index) => {
    const { component: Component, name, icon, items: subItems, ...rest } = item
    return (
      <Component compact as="div" key={index} {...rest}>
        {/* <div className="nav-link">
          {navLink(name, icon)}  */}
        {/* </div> */}
        {subItems?.map((subItem, subIndex) =>
          subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true),
        )}
      </Component>
    )
  }

  // Selectors to determine which section to show
  const { home, master, reports, expense, support } = useSelector((state) => state.navbar)

  // Filter items based on active section dashboard
  const filterItemsForSection = (section) => {
    console.log('Filtering for master dashboard:', section)
    if (section === 'home') {
      return items.filter((item) => item.name === 'Dashboard')
    }
    return items
  }

  // Filter items based on active section master
  const filterItemsForSection1 = (section) => {
    console.log('Filtering for master section:', section)
    if (section === 'master') {
      const filteredItems = items.filter((item) => item.name === 'Master')
      console.log('Filtered items for master:', filteredItems)
      return filteredItems
    }
    return items
  }

  // Filter items based on active section Reports
  const filterItemsForSection2 = (section) => {
    console.log('Filtering for reports section:', section)
    if (section === 'reports') {
      return items.filter((item) => item.name === 'Report')
    }
    return items
  }

  // Filter items based on active section Expense Management
  const filterItemsForSection3 = (section) => {
    console.log('Filtering for Expense management section:', section)
    if (section === 'expense') {
      return items.filter((item) => item.name === 'Expense Management')
    }
    return items
  }

  // Filter items based on active section Expense Management
  const filterItemsForSection4 = (section) => {
    console.log('Filtering for Help and Supports section:', section)
    if (section === 'support') {
      return items.filter((item) => item.name === 'Supports')
    }
    return items
  }

  // Render the sidebar navigation
  return (
    <>
      {home && (
        <CSidebarNav as={SimpleBar}>
          {filterItemsForSection('home').map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
        </CSidebarNav>
      )}

      {master && (
        <CSidebarNav as={SimpleBar}>
          {filterItemsForSection1('master').map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
        </CSidebarNav>
      )}

      {reports && (
        <CSidebarNav as={SimpleBar}>
          {filterItemsForSection2('reports').map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
        </CSidebarNav>
      )}

      {expense && (
        <CSidebarNav as={SimpleBar}>
          {filterItemsForSection3('expense').map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
        </CSidebarNav>
      )}

      {support && (
        <CSidebarNav as={SimpleBar}>
          {filterItemsForSection4('support').map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
        </CSidebarNav>
      )}
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

// ################################################################################################################# //
// New COde

// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import PropTypes from 'prop-types'

// import SimpleBar from 'simplebar-react'
// import 'simplebar-react/dist/simplebar.min.css'

// import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

// export const AppSidebarNav = ({ items }) => {
//   const navLink = (name, icon, badge, indent = true) => {
//     return (
//       <>
//         {icon
//           ? icon
//           : indent && (
//             <span className="nav-icon">
//               <span className="nav-icon-bullet"></span>
//             </span>
//           )}
//         {name && name}
//         {badge && (
//           <CBadge color={badge.color} className="ms-auto">
//             {badge.text}
//           </CBadge>
//         )}
//       </>
//     )
//   }

//   const navItem = (item, index, indent = false) => {
//     const { component, name, badge, icon, ...rest } = item
//     const Component = component
//     return (
//       <Component as="div" key={index}>
//         {rest.to || rest.href ? (
//           <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
//             {navLink(name, icon, badge, indent)}
//           </CNavLink>
//         ) : (
//           navLink(name, icon, badge, indent)
//         )}
//       </Component>
//     )
//   }

//   const navGroup = (item, index) => {
//     const { component, name, icon, items, to, ...rest } = item
//     const Component = component
//     return (
//       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
//         {item.items?.map((item, index) =>
//           item.items ? navGroup(item, index) : navItem(item, index, true),
//         )}
//       </Component>
//     )
//   }

//   return (
//     <CSidebarNav as={SimpleBar}>
//       {items &&
//         items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
//     </CSidebarNav>
//   )
// }

// AppSidebarNav.propTypes = {
//   items: PropTypes.arrayOf(PropTypes.any).isRequired,
// }
