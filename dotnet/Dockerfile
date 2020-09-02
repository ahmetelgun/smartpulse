# https://hub.docker.com/_/microsoft-dotnet-core
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build


COPY ./src /source
WORKDIR /source
RUN apt update
RUN apt install -y vim
RUN dotnet add package Microsoft.EntityFrameworkCore.Sqlite
RUN dotnet tool install --global dotnet-ef
RUN echo "export PATH=$PATH:/root/.dotnet/tools" >> /root/.bashrc
RUN export PATH=$PATH:/root/.dotnet/tools
RUN dotnet add package Microsoft.EntityFrameworkCore.Design
RUN dotnet add package System.IdentityModel.Tokens.Jwt
#RUN /root/.dotnet/tools/dotnet-ef migrations add InitialCreate
#RUN /root/.dotnet/tools/dotnet-ef database update

#
## final stage/image
#FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
#WORKDIR /app
#COPY --from=build /app ./
#ENTRYPOINT ["dotnet", "aspnetapp.dll"]
