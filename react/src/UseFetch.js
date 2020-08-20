import React, { useState, useEffect } from 'react'

const useFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const callFetch = async (url, options) => {
    if (data) {
      setData(null);
    }
    if (error) {
      setError(null);
    }
    if (!loading) {
      setLoading(true);
    }
    if (url) {
      await fetch(url, options)
        .then(res => res.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(e => { setError(e); setLoading(false) });
    }
  }
  useEffect(() => {
    if (url) {
      callFetch(url, options)
    }
  }, [])
  return [data, loading, error, callFetch]

}
export default useFetch;