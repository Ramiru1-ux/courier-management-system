import { useCallback, useState } from 'react';
import trackingApi from '../api/trackingApi';
export default function useTracking(){const [state,setState]=useState({data:null,loading:false,error:null}); const track=useCallback(async(number)=>{setState({data:null,loading:true,error:null});try{const data=await trackingApi.getByTrackingNumber(number);setState({data,loading:false,error:null});return data;}catch(error){setState({data:null,loading:false,error});throw error;}},[]);return {...state,track};}
