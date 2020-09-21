import React, { createContext, useState } from 'react';
const MyContext = createContext();
const today = new Date();
export function MyProvider({ children }) {
    const [isLogin, setIsLogin] = useState(false);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedProductions, setSelectedProductions] = useState([]);
    const [centralsUpdate, toggleCentralsUpdate] = useState(false);
    const [productionUpdate, toggleProductionUpdate] = useState(false);
    const [endDate, setEndDate] = useState(today.toJSON().slice(0, 10));
    today.setDate(today.getDate() - 1)
    const [startDate, setStartDate] = useState(today.toJSON().slice(0, 10));
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
