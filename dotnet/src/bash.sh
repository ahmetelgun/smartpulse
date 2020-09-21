#!/bin/bash

cd /source
/root/.dotnet/tools/dotnet-ef migrations add user_added3q234
/root/.dotnet/tools/dotnet-ef database update
dotnet watch --project /source run 
#tail -f /dev/null