import React, { createContext, useState } from 'react';
const MyContext = createContext();
export function MyProvider({ children }) {
    const [isLogin, setIsLogin] = useState(false);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedProductions, setSelectedProductions] = useState([]);
    const [centralsUpdate, toggleCentralsUpdate] = useState(false);
    const [productionUpdate, toggleProductionUpdate] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedStations, setSelectedStations] = useState([]);

    const [watchList, setWatchList] = useState(false);
    return (
        <MyContext.Provider value={{ selectedStations, setSelectedStations, startDate, setStartDate, endDate, setEndDate, setSelectedType, selectedType, selectedCompanies, setSelectedCompanies, centralsUpdate, toggleCentralsUpdate, isLogin, selectedProductions, setSelectedProductions, productionUpdate, toggleProductionUpdate, setWatchList, watchList, setIsLogin }}>
            {children}
        </MyContext.Provider>
    )
}
export default MyContext;
